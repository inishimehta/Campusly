package ca.gbc.comp3074.campusly

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel

@Composable
fun EventDetailsScreen(
    eventId: Long,
    viewModel: EventViewModel,
    onBack: () -> Unit,
    onEditClick: (Long) -> Unit = {}
) {
    // Fetch the event by ID from Room
    val event = viewModel.getEventById(eventId).collectAsState(initial = null).value

    if (event == null) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Text("Event not found", style = MaterialTheme.typography.bodyLarge)
        }
        return
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(event.name, fontSize = 24.sp, fontWeight = FontWeight.Bold)
        Text("📅 ${event.dateTime}", style = MaterialTheme.typography.bodyMedium)
        Text("📍 ${event.location}", style = MaterialTheme.typography.bodyMedium)
        Text(event.description, style = MaterialTheme.typography.bodyLarge)

        Spacer(Modifier.height(20.dp))

        // 🔹 RSVP Button
        OutlinedButton(onClick = { viewModel.toggleRsvp(event) },
            colors = ButtonDefaults.buttonColors(containerColor = accentYellow, contentColor = Color.Black)) {
            Text(if (event.rsvp) "Going ✅" else "RSVP to this Event")
        }

        // 🔹 Open in Google Maps
        OutlinedButton(
            onClick = {
            val gmmIntentUri = Uri.parse("google.navigation:q=${Uri.encode(event.location)}")
            val mapIntent = Intent(Intent.ACTION_VIEW, gmmIntentUri)
            mapIntent.setPackage("com.google.android.apps.maps")
        },
            colors = ButtonDefaults.buttonColors(containerColor = accentYellow, contentColor = Color.Black)) {
            Text("Get Directions")
        }

        // 🔹 Edit Event
        OutlinedButton(onClick = { onEditClick(event.id) },
            colors = ButtonDefaults.buttonColors(containerColor = accentYellow, contentColor = Color.Black)) {
            Text("Edit Event")
        }

        // 🔹 Back Button
        OutlinedButton(onClick = onBack,
            colors = ButtonDefaults.buttonColors(containerColor = accentYellow, contentColor = Color.Black)) {
            Text("Back to Events")
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun EventDetailsPreview() {
    MaterialTheme {
        //PlaceDetailsScreen(id = 2)
    }
}