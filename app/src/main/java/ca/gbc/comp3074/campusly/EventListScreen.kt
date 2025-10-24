package ca.gbc.comp3074.campusly

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EventListScreen(
    viewModel: EventViewModel,
    onEventClick: (Long) -> Unit,
    onAddEvent: () -> Unit) {
    val events by viewModel.allEvents.collectAsState()

    // Divide into RSVPed and non-RSVPed events
    val rsvpedEvents = events.filter { it.rsvp }
    val otherEvents = events.filter { !it.rsvp }

    var name by remember { mutableStateOf("") }
    var location by remember { mutableStateOf("") }
    var dateTime by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Campus Events") },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = blueStart,
                    navigationIconContentColor = Color.White,
                    titleContentColor = Color.White
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
        ) {
            // RSVPed Events List
            if (rsvpedEvents.isNotEmpty()) {
                Text(
                    "Your RSVPed Events:",
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.primary
                )
                Spacer(modifier = Modifier.height(8.dp))

                LazyColumn(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 16.dp)
                ) {
                    items(rsvpedEvents) { event ->
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFFE8F5E9)), // light green tint
                            elevation = CardDefaults.cardElevation(2.dp)
                        ) {
                            Column(Modifier.padding(16.dp)) {
                                Text(text = event.name, style = MaterialTheme.typography.titleMedium)
                                Text(text = "📍 ${event.location}")
                                Text(text = "📅 ${event.dateTime}")
                                Text(text = event.description, style = MaterialTheme.typography.bodySmall)

                                Spacer(modifier = Modifier.height(8.dp))

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    TextButton(onClick = { onEventClick(event.id) }) {
                                        Text("View Details")
                                    }
                                    TextButton(onClick = { viewModel.toggleRsvp(event) }) {
                                        Text("Cancel RSVP", color = Color.Red)
                                    }
                                }
                            }
                        }
                    }
                }
                Spacer(modifier = Modifier.height(16.dp))
                Divider(color = Color.Gray.copy(alpha = 0.3f), thickness = 1.dp)
                Spacer(modifier = Modifier.height(16.dp))
            }

            // ✳️ All Other Events Section
            Text(
                "All Events:",
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.primary
            )
            Spacer(modifier = Modifier.height(8.dp))

            // Event List
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(otherEvents) { event ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        elevation = CardDefaults.cardElevation(2.dp)
                    ) {
                        Column(Modifier.padding(16.dp)) {
                            Text(event.name, style = MaterialTheme.typography.titleMedium)
                            Text("📍 ${event.location}")
                            Text("📅 ${event.dateTime}")
                            Spacer(modifier = Modifier.height(8.dp))

                            Row(
                                horizontalArrangement = Arrangement.SpaceBetween,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Button(
                                    onClick = { viewModel.toggleRsvp(event) },
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = if (event.rsvp) Color(0xFF4CAF50) else Color(0xFFFFC107),
                                        contentColor = Color.Black
                                    )
                                ) {
                                    Text(if (event.rsvp) "Going" else "RSVP")
                                }
                                Button(onClick = { onEventClick(event.id) },
                                    colors = ButtonDefaults.buttonColors(containerColor = accentYellow, contentColor = Color.Black)) {
                                    Text("Details")
                                }

                                Button(onClick = { viewModel.deleteEvent(event) },
                                    colors = ButtonDefaults.buttonColors(containerColor = accentYellow, contentColor = MaterialTheme.colorScheme.error)) {
                                    Text("Delete")
                                }
                            }
                        }
                    }
                }
            }

            Text("Add a new event", style = MaterialTheme.typography.titleMedium, color = blueStart)
            // Add Event Form
            OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Event Name") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(value = location, onValueChange = { location = it }, label = { Text("Location") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(value = dateTime, onValueChange = { dateTime = it }, label = { Text("Date & Time") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(value = description, onValueChange = { description = it }, label = { Text("Description") }, modifier = Modifier.fillMaxWidth())

            Spacer(modifier = Modifier.height(8.dp))

            Button(
                onClick = {
                    if (name.isNotBlank() && location.isNotBlank()) {
                        viewModel.addEvent(name, location, dateTime, description)
                        name = ""; location = ""; dateTime = ""; description = ""
                    }
                },
                modifier = Modifier.align(Alignment.End),
                colors = ButtonDefaults.buttonColors(containerColor = accentYellow, contentColor = Color.Black)
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add")
                Spacer(modifier = Modifier.width(4.dp))
                Text("Add")
            }
        }
    }
}
