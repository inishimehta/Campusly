package ca.gbc.comp3074.campusly

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
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
fun HomeScreen(onPlaces: () -> Unit, onAbout: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text("Welcome to Campusly", style = MaterialTheme.typography.headlineSmall)
        Button(onClick = onPlaces) { Text("Places") }
        Button(onClick = onAbout) { Text("About") }
        OutlinedButton(onClick = {}) { Text("Events (placeholder)") }
        OutlinedButton(onClick = {}) { Text("Chats (placeholder)") }
    }
}

@Preview(showBackground = true)
@Composable
private fun HomePreview() {
    MaterialTheme { HomeScreen(onPlaces = {}, onAbout = {}) }
}
