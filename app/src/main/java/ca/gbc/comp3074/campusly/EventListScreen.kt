package ca.gbc.comp3074.campusly

import android.os.Build
import androidx.annotation.RequiresApi
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import ca.gbc.comp3074.campusly.data.CampuslyFakeData
import ca.gbc.comp3074.campusly.data.Event

data class EventUi(
    val id: Long,
    val name: String,
    val location: String,
    val dateTime: String,
    val description: String,
    val rsvp: Boolean = false
)


@Composable
fun EventListScreen(
    onOpenDetails: (Long) -> Unit
) {
    val events = CampuslyFakeData.Event
    var searchQuery by remember { mutableStateOf("") }

    Column(
        Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            "Upcoming Events",
            style = MaterialTheme.typography.headlineSmall,
            modifier = Modifier.padding(16.dp)
        )

        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            label = { Text("Search by name, date, or time") },
            modifier = Modifier.fillMaxWidth()
        )

        val filteredEvents = events.filter { event ->
            searchQuery.isBlank() ||
                    event.name.contains(searchQuery, ignoreCase = true) ||
                    event.dateTime.contains(searchQuery, ignoreCase = true)
        }


        LazyColumn(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(filteredEvents) { event ->
                EventCard(event = event, onOpenDetails = onOpenDetails)
            }
        }
    }
}

@Composable
fun EventCard(
    event: Event,
    onOpenDetails: (Long) -> Unit
) {
    ElevatedCard(
        onClick = { onOpenDetails(event.id) },
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(Modifier.padding(16.dp)) {
            Text(event.name, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            Text(event.location)
            Text(
                event.dateTime,
                style = MaterialTheme.typography.bodySmall
            )
            Text(event.description, style = MaterialTheme.typography.bodyMedium)
        }
    }
}


@Preview(showBackground = true)
@Composable
private fun EventListPreview() {
    MaterialTheme { EventListScreen(onOpenDetails = {}) }
}
