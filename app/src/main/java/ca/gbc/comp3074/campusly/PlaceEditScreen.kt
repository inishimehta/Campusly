package ca.gbc.comp3074.campusly

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Label
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Label
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
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
fun PlaceEditScreen(id: Long, onDone: () -> Unit, onCancel: () -> Unit) {
    var name by rememberSaveable { mutableStateOf("") }
    var address by rememberSaveable { mutableStateOf("") }
    var tags by rememberSaveable { mutableStateOf("") }
    var phone by rememberSaveable { mutableStateOf("") }
    var desc by rememberSaveable { mutableStateOf("") }
    var imagePath by rememberSaveable { mutableStateOf("") } // new field for image path

    Column(
        Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text("Add Place", style = MaterialTheme.typography.headlineSmall) // always show Add Place

        Text ("Name", fontWeight = FontWeight.Bold)
        OutlinedTextField(
            value = name,
            onValueChange = { name = it },
            label = { Text("enter place name") },
            placeholder = { Text("name") },
            leadingIcon = { Icon(Icons.Default.Person, contentDescription = "Name") },
            modifier = Modifier.fillMaxWidth()
        )
        Text("Address", fontWeight = FontWeight.Bold)
        OutlinedTextField(
            value = address,
            onValueChange = { address = it },
            label = { Text("Enter full address") },
            placeholder = { Text("address") },
            leadingIcon = { Icon(Icons.Default.LocationOn, contentDescription = "Address") },
            modifier = Modifier.fillMaxWidth()
        )
        Text("Tags", fontWeight = FontWeight.Bold)
        OutlinedTextField(
            value = tags,
            onValueChange = { tags = it },
            label = { Text("tags study space, Wifi, 24/7 Access") },
            placeholder = { Text("tags") },
            leadingIcon = { Icon(Icons.Default.Label, contentDescription = "Tags") },
            modifier = Modifier.fillMaxWidth()
        )
        Text("Phone", fontWeight = FontWeight.Bold)
        OutlinedTextField(
            value = phone,
            onValueChange = { phone = it },
            label = { Text("(555) 123-4567") },
            placeholder = { Text("phone number") },
            leadingIcon = { Icon(Icons.Default.Phone, contentDescription = "Phone") },
            modifier = Modifier.fillMaxWidth()
        )
        Text("Description", fontWeight = FontWeight.Bold)
        OutlinedTextField(
            value = desc,
            onValueChange = { desc = it },
            label = { Text("Describe the place, its features, and what makes it special...") },
            leadingIcon = { Icon(Icons.Default.Description, contentDescription = "Description") },
            placeholder = { Text("description") },
            modifier = Modifier.fillMaxWidth()
        )

        // Upload Image button (for selecting a file)
        Button(onClick = { /* TODO: open file picker */ }, modifier = Modifier.fillMaxWidth()) {
            Text(if (imagePath.isEmpty()) "Upload Image" else "Image Selected")
        }

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
private fun EditPreview() {
    MaterialTheme { PlaceEditScreen(id = -1, onDone = {}, onCancel = {}) }
}
