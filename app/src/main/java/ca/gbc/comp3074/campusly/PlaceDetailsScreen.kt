package ca.gbc.comp3074.campusly

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp

@Composable
fun PlaceDetailsScreen(id: Long, onEdit: () -> Unit, onBack: () -> Unit) {
    Column(
        Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text("Place Details #$id", style = MaterialTheme.typography.headlineSmall)
        Text("Address: 160 Kendal Ave, Toronto")
        Text("Tags: study, quiet")
        Text("Phone: (416) 555-0101")
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedButton(onClick = { /* TODO: view map */ }) { Text("View Map") }
            OutlinedButton(onClick = { /* TODO: navigate */ }) { Text("Get Directions") }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedButton(onClick = { /* TODO: email share */ }) { Text("Share via Email") }
            Button(onClick = onEdit) { Text("Edit") }
        }
        OutlinedButton(onClick = onBack) { Text("Back") }
    }
}

@Preview(showBackground = true)
@Composable
private fun DetailsPreview() {
    MaterialTheme { PlaceDetailsScreen(id = 1, onEdit = {}, onBack = {}) }
}
