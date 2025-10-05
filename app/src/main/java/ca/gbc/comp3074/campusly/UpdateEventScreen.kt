package ca.gbc.comp3074.campusly

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Event
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp

@Composable
fun UpdateEventScreen(id: Long, onDone: () -> Unit, onCancel: () -> Unit) {
    var name by rememberSaveable { mutableStateOf("") }
    var dateTime by rememberSaveable { mutableStateOf("") }
    var location by rememberSaveable { mutableStateOf("") }
    var organizer by rememberSaveable { mutableStateOf("") }
    var description by rememberSaveable { mutableStateOf("") }

    Column(
        Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(
            text = if (id == -1L) "Add Event" else "Edit Event #$id",
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold
        )

        Text("Event Name", fontWeight = FontWeight.Bold)
        OutlinedTextField(
            value = name,
            onValueChange = { name = it },
            label = { Text("Enter event name") },
            placeholder = { Text("e.g., Campus Orientation") },
            leadingIcon = { Icon(Icons.Default.Event, contentDescription = "Event Name") },
            modifier = Modifier.fillMaxWidth()
        )

        Text("Date & Time", fontWeight = FontWeight.Bold)
        OutlinedTextField(
            value = dateTime,
            onValueChange = { dateTime = it },
            label = { Text("Enter date and time") },
            placeholder = { Text("YYYY-MM-DD HH:MM") },
            leadingIcon = { Icon(Icons.Default.CalendarMonth, contentDescription = "Date and Time") },
            modifier = Modifier.fillMaxWidth()
        )

        Text("Location", fontWeight = FontWeight.Bold)
        OutlinedTextField(
            value = location,
            onValueChange = { location = it },
            label = { Text("Enter event location") },
            placeholder = { Text("e.g., Main Hall") },
            leadingIcon = { Icon(Icons.Default.LocationOn, contentDescription = "Location") },
            modifier = Modifier.fillMaxWidth()
        )

        Text("Organizer", fontWeight = FontWeight.Bold)
        OutlinedTextField(
            value = organizer,
            onValueChange = { organizer = it },
            label = { Text("Enter organizer name or club") },
            placeholder = { Text("e.g., Student Union") },
            leadingIcon = { Icon(Icons.Default.Person, contentDescription = "Organizer") },
            modifier = Modifier.fillMaxWidth()
        )

        Text("Description", fontWeight = FontWeight.Bold)
        OutlinedTextField(
            value = description,
            onValueChange = { description = it },
            label = { Text("Describe the event details and agenda...") },
            leadingIcon = { Icon(Icons.Default.Description, contentDescription = "Description") },
            placeholder = { Text("Description") },
            modifier = Modifier.fillMaxWidth()
        )

        RowButtons(onDone = onDone, onCancel = onCancel)
    }
}

@Composable
private fun RowButtons(onDone: () -> Unit, onCancel: () -> Unit) {
    androidx.compose.foundation.layout.Row(
        modifier = Modifier.fillMaxSize(),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.Bottom
    ) {
        Button(onClick = onCancel) { Text("Cancel") }
        Button(onClick = onDone) { Text("Save") }
    }
}

@Preview(showBackground = true)
@Composable
private fun EventEditPreview() {
    MaterialTheme {
        UpdateEventScreen(id = -1, onDone = {}, onCancel = {})
    }
}
