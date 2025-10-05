package ca.gbc.comp3074.campusly

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ca.gbc.comp3074.campusly.data.CampuslyFakeData
import ca.gbc.comp3074.campusly.data.Event

@Composable
fun EventDetailsScreen(
    eventId: Long,
    onBack: () -> Unit,
    onRSVP: () -> Unit
) {
    val event = CampuslyFakeData.Event.find { it.id == eventId }

    if (event == null) {
        Box(
            Modifier.fillMaxSize(),
            contentAlignment = androidx.compose.ui.Alignment.Center
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

        Button(onClick = onRSVP ){
            Text("RSVP to this Event")
        }

        Button(onClick = {
            // Launch Google Maps with directions from current location
            val gmmIntentUri = Uri.parse("google.navigation:q=${Uri.encode(event.location)}")
            val mapIntent = Intent(Intent.ACTION_VIEW, gmmIntentUri)
            mapIntent.setPackage("com.google.android.apps.maps")
            onBack() // optional navigation after opening
        }) {
            Text("Get Directions")
        }

        OutlinedButton(onClick = onBack) {
            Text("Back to Events")
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun EventDetailsPreview() {
    MaterialTheme { EventDetailsScreen(eventId = 1, onRSVP = {}, onBack = {}) }
}