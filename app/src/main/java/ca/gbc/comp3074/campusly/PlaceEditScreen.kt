package ca.gbc.comp3074.campusly

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
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
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp

@Composable
fun PlaceEditScreen(id: Long, onDone: () -> Unit, onCancel: () -> Unit) {
    var name by rememberSaveable { mutableStateOf("") }
    var address by rememberSaveable { mutableStateOf("") }
    var tags by rememberSaveable { mutableStateOf("") }
    var phone by rememberSaveable { mutableStateOf("") }
    var desc by rememberSaveable { mutableStateOf("") }

    Column(
        Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(if (id == -1L) "Add Place" else "Edit Place #$id", style = MaterialTheme.typography.headlineSmall)
        OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Name") }, modifier = Modifier.fillMaxSize())
        OutlinedTextField(value = address, onValueChange = { address = it }, label = { Text("Address") })
        OutlinedTextField(value = tags, onValueChange = { tags = it }, label = { Text("Tags (comma)") })
        OutlinedTextField(value = phone, onValueChange = { phone = it }, label = { Text("Phone") })
        OutlinedTextField(value = desc, onValueChange = { desc = it }, label = { Text("Description") })
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
