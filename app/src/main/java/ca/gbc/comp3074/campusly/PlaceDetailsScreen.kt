package ca.gbc.comp3074.campusly

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PlaceDetailsScreen(
    id: Long,
    vm: PlacesViewModel,
    onBack: () -> Unit,
    onEdit: () -> Unit,
    onNavigateToPlace: (Long) -> Unit,
    onOpenMap: (String) -> Unit
) {
    val context = LocalContext.current

    // Load selected place
    val placeState = produceState<PlaceEntity?>(initialValue = null, id) {
        value = vm.getPlaceById(id)
    }
    val place = placeState.value

    if (place == null) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("Place not found.")
        }
        return
    }

    // For similar places carousel
    val allPlaces by vm.places.collectAsState(initial = emptyList())

    var isFavorite by remember { mutableStateOf(false) }
    var showRating by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {},
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, null)
                    }
                },
                actions = {
                    IconButton(onClick = onEdit) {
                        Icon(Icons.Default.Edit, null)
                    }

                    IconButton(onClick = {
                        vm.deletePlace(place)
                        onBack()
                    }) {
                        Icon(Icons.Default.Delete, contentDescription = "Delete")
                    }
                }
            )
        }
    ) { padding ->

        Column(
            Modifier
                .padding(padding)
                .verticalScroll(rememberScrollState())
        ) {

            // ---------------- HEADER IMAGE ----------------
            Box {
                AsyncImage(
                    model = place.imageUri ?: R.drawable.placeholder_image,
                    contentDescription = place.name,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(260.dp)
                )

                IconButton(
                    onClick = { isFavorite = !isFavorite },
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(12.dp)
                        .clip(CircleShape)
                        .background(Color.White.copy(alpha = 0.9f))
                ) {
                    Icon(
                        if (isFavorite) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                        contentDescription = null,
                        tint = if (isFavorite) Color.Red else Color.Gray
                    )
                }
            }

            // ---------------- CONTENT ----------------
            Column(
                Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp))
                    .background(Color.White)
                    .padding(20.dp)
            ) {

                Text(place.name, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.headlineSmall)

                Spacer(Modifier.height(6.dp))

                // Address Row
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.LocationOn, tint = Color.Gray, contentDescription = null)
                    Spacer(Modifier.width(4.dp))
                    Text(place.campus, color = Color.Gray)
                }

                Spacer(Modifier.height(16.dp))

                // TAGS
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    place.tags.forEach { tag ->
                        Box(
                            Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .background(Color(0xFFF2F2F7))
                                .padding(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Text(tag, color = Color(0xFF3A3A3C))
                        }
                    }
                }

                Spacer(Modifier.height(18.dp))

                // PHONE (you don't store phone, but UI expects it)
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Phone, contentDescription = null, tint = Color.Gray)
                    Spacer(Modifier.width(8.dp))
                    Text("No phone listed", color = Color.Gray)
                }

                Spacer(Modifier.height(10.dp))

                // RATING
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Star, tint = Color(0xFFFFD700), contentDescription = null)
                    Spacer(Modifier.width(4.dp))
                    Text("${place.rating}", fontWeight = FontWeight.SemiBold)
                }

                Spacer(Modifier.height(20.dp))

                // DESCRIPTION
                Text(place.description)

                Spacer(Modifier.height(22.dp))

                // ---------------- ACTION BUTTONS ROW ----------------
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {

                    // Directions
                    Button(
                        onClick = {
                            val nav = Uri.parse("google.navigation:q=${place.campus}")
                            context.startActivity(Intent(Intent.ACTION_VIEW, nav))
                        },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1C1C1E))
                    ) {
                        Icon(Icons.Default.Directions, null)
                        Spacer(Modifier.width(6.dp))
                        Text("Directions")
                    }

                    // Share
                    OutlinedButton(
                        onClick = {
                            val send = Intent(Intent.ACTION_SEND)
                            send.type = "text/plain"
                            send.putExtra(Intent.EXTRA_TEXT, "Check out ${place.name} at ${place.campus}!")
                            context.startActivity(Intent.createChooser(send, "Share via"))
                        },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Icon(Icons.Default.Share, null)
                        Spacer(Modifier.width(6.dp))
                        Text("Share")
                    }
                }

                Spacer(Modifier.height(12.dp))

                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {

                    OutlinedButton(
                        onClick = { showRating = true },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Icon(Icons.Default.StarBorder, null)
                        Spacer(Modifier.width(6.dp))
                        Text("Rate")
                    }

                    OutlinedButton(
                        onClick = { onOpenMap(place.campus) },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Icon(Icons.Default.Map, null)
                        Spacer(Modifier.width(6.dp))
                        Text("View Full Map")
                    }
                }

                Spacer(Modifier.height(30.dp))

                // ---------------- SIMILAR PLACES ----------------
                Text("Similar Places Nearby", fontWeight = FontWeight.Bold)

                Spacer(Modifier.height(14.dp))

                LazyRow(horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                    items(allPlaces.filter { it.id != place.id }) { nearby ->

                        Card(
                            modifier = Modifier
                                .width(170.dp)
                                .clickable { onNavigateToPlace(nearby.id) },
                            shape = RoundedCornerShape(14.dp)
                        ) {
                            Column {
                                AsyncImage(
                                    model = nearby.imageUri ?: R.drawable.placeholder_image,
                                    contentDescription = nearby.name,
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(110.dp)
                                )
                                Column(Modifier.padding(10.dp)) {
                                    Text(nearby.name, fontWeight = FontWeight.Medium)
                                    Spacer(Modifier.height(4.dp))
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(Icons.Default.Star, tint = Color(0xFFFFD700), contentDescription = null)
                                        Spacer(Modifier.width(4.dp))
                                        Text("${nearby.rating}", color = Color.Gray)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // ---------------- RATING POPUP ----------------
    if (showRating) {
        AlertDialog(
            onDismissRequest = { showRating = false },
            title = { Text("Rate ${place.name}") },
            text = {
                var rating by remember { mutableStateOf(0) }
                Row {
                    (1..5).forEach { i ->
                        Icon(
                            if (i <= rating) Icons.Default.Star else Icons.Default.StarBorder,
                            contentDescription = null,
                            tint = Color(0xFFFFD700),
                            modifier = Modifier
                                .size(40.dp)
                                .clickable { rating = i }
                        )
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showRating = false }) { Text("Submit") }
            },
            dismissButton = {
                TextButton(onClick = { showRating = false }) { Text("Cancel") }
            }
        )
    }
}
