package ca.gbc.comp3074.campusly

import android.content.Intent
import android.location.Geocoder
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.maps.android.compose.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.*

fun getCampusLatLng(address: String): LatLng? =
    when {
        address.contains("casa loma", ignoreCase = true) ->
            LatLng(43.6767, -79.4109)

        address.contains("st james", ignoreCase = true) ||
                address.contains("st. james", ignoreCase = true) ->
            LatLng(43.6505, -79.3700)

        address.contains("waterfront", ignoreCase = true) ->
            LatLng(43.6405, -79.3802)

        else -> null
    }

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MapScreen(
    address: String,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    var latLng by remember { mutableStateOf<LatLng?>(null) }

    // Load coordinates
    LaunchedEffect(address) {
        val static = getCampusLatLng(address)
        if (static != null) {
            latLng = static
            return@LaunchedEffect
        }

        // fallback -> Geocoder
        withContext(Dispatchers.IO) {
            runCatching {
                val geo = Geocoder(context, Locale.getDefault())
                val r = geo.getFromLocationName(address, 1)
                if (!r.isNullOrEmpty()) {
                    latLng = LatLng(r[0].latitude, r[0].longitude)
                }
            }
        }
    }

    val bg = Color(0xFFF4F4F6)

    Scaffold(
        containerColor = bg,
        topBar = {}
    ) { pad ->

        Box(
            Modifier
                .padding(pad)
                .fillMaxSize()
                .background(bg)
        ) {

            if (latLng == null) {
                Box(Modifier.fillMaxSize(), Alignment.Center) {
                    CircularProgressIndicator()
                }
                return@Box
            }

            val cameraState = rememberCameraPositionState {
                position = CameraPosition.fromLatLngZoom(latLng!!, 17f)
            }

            // Google map MUST NOT be clipped
            GoogleMap(
                modifier = Modifier.fillMaxSize(),
                cameraPositionState = cameraState
            ) {
                Marker(
                    state = MarkerState(position = latLng!!),
                    title = "Campus",
                    snippet = address
                )
            }

            // Fake rounded overlay (visual rounding)
            Box(
                Modifier
                    .matchParentSize()
                    .clip(RoundedCornerShape(28.dp))
                    .background(Color.White.copy(alpha = 0.0f))
            )

            // Back button
            IconButton(
                onClick = onBack,
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .padding(16.dp)
                    .size(42.dp)
                    .clip(RoundedCornerShape(14.dp))
                    .background(Color.White)
            ) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, null, tint = Color.Black)
            }

            // Zoom buttons
            Column(
                Modifier
                    .align(Alignment.TopEnd)
                    .padding(16.dp),
                Arrangement.spacedBy(10.dp)
            ) {
                IconButton(
                    onClick = { scope.launch {
                        cameraState.animate(CameraUpdateFactory.zoomIn(), 250)
                    }},
                    modifier = Modifier
                        .size(42.dp)
                        .clip(RoundedCornerShape(14.dp))
                        .background(Color.White)
                ) { Icon(Icons.Default.Add, null) }

                IconButton(
                    onClick = { scope.launch {
                        cameraState.animate(CameraUpdateFactory.zoomOut(), 250)
                    }},
                    modifier = Modifier
                        .size(42.dp)
                        .clip(RoundedCornerShape(14.dp))
                        .background(Color.White)
                ) { Icon(Icons.Default.Remove, null) }
            }

            // Bottom card
            Surface(
                shape = RoundedCornerShape(24.dp),
                color = Color.White,
                shadowElevation = 8.dp,
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(16.dp)
            ) {
                Column(
                    Modifier.padding(20.dp)
                ) {
                    Text("Location", fontWeight = FontWeight.Bold)
                    Spacer(Modifier.height(6.dp))
                    Text(address, color = Color.Gray)

                    Spacer(Modifier.height(16.dp))

                    Button(
                        onClick = {
                            val intent = Intent(Intent.ACTION_VIEW).apply {
                                data = Uri.parse("google.navigation:q=$address")
                            }
                            context.startActivity(intent)
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp),
                        shape = RoundedCornerShape(24.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF111118))
                    ) {
                        Text("Start Directions")
                    }
                }
            }
        }
    }
}
