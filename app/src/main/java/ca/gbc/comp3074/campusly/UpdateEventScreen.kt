package ca.gbc.comp3074.campusly

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.tooling.preview.Preview
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UpdateEventScreen(
    eventId: Long,
    viewModel: EventViewModel,
    onSave: () -> Unit,
    onCancel: () -> Unit
) {
    val scope = rememberCoroutineScope()

    // Get the event data from the DB if editing
    val event = viewModel.getEventById(eventId).collectAsState(initial = null).value

    // Local state for editable fields
    var name by remember { mutableStateOf(event?.name ?: "") }
    var dateTime by remember { mutableStateOf(event?.dateTime ?: "") }
    var location by remember { mutableStateOf(event?.location ?: "") }
    var description by remember { mutableStateOf(event?.description ?: "") }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text(if (eventId == -1L) "Add Event" else "Edit Event") },
                navigationIcon = {
                    IconButton(onClick = onCancel) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary,
                    navigationIconContentColor = MaterialTheme.colorScheme.onPrimary
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Event Name") },
                leadingIcon = { Icon(Icons.Default.Event, contentDescription = null) },
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = dateTime,
                onValueChange = { dateTime = it },
                label = { Text("Date & Time") },
                placeholder = { Text("YYYY-MM-DD HH:MM") },
                leadingIcon = { Icon(Icons.Default.CalendarMonth, contentDescription = null) },
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = location,
                onValueChange = { location = it },
                label = { Text("Location") },
                leadingIcon = { Icon(Icons.Default.LocationOn, contentDescription = null) },
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = description,
                onValueChange = { description = it },
                label = { Text("Description") },
                leadingIcon = { Icon(Icons.Default.Description, contentDescription = null) },
                modifier = Modifier.fillMaxWidth(),
                maxLines = 3
            )

            Spacer(modifier = Modifier.height(16.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                OutlinedButton(onClick = onCancel) {
                    Text("Cancel")
                }

                Button(onClick = {
                    if (name.isNotBlank() && location.isNotBlank()) {
                        scope.launch {
                            if (eventId == -1L) {
                                // Add new event
                                viewModel.addEvent(name, location, dateTime, description)
                            } else {
                                // Update existing event
                                val updatedEvent = event?.copy(
                                    name = name,
                                    location = location,
                                    dateTime = dateTime,
                                    description = description
                                )
                                if (updatedEvent != null) {
                                    viewModel.updateEvent(updatedEvent)
                                }
                            }
                            onSave()
                        }
                    }
                }) {
                    Icon(Icons.Default.Check, contentDescription = "Save")
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Save")
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun UpdateEventPreview() {
    MaterialTheme { }
}

