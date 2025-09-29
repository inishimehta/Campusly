package ca.gbc.comp3074.campusly

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.Button
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp

data class PlaceUi(val id: Long, val name: String, val tags: String, val rating: Int)

private val mockPlaces = listOf(
    PlaceUi(1, "Library", "study,quiet", 5),
    PlaceUi(2, "Cafeteria", "food", 4),
    PlaceUi(3, "Gym", "fitness", 4)
)

@Composable
fun PlacesListScreen(
    onOpenDetails: (Long) -> Unit,
    onAdd: () -> Unit
) {
    Column(Modifier.fillMaxSize()) {
        Text("Places", style = MaterialTheme.typography.headlineSmall, modifier = Modifier.padding(16.dp))
        LazyColumn(
            modifier = Modifier.weight(1f),
            contentPadding = PaddingValues(16.dp)
        ) {
            items(mockPlaces.size) { i ->
                val p = mockPlaces[i]
                ElevatedCard(
                    onClick = { onOpenDetails(p.id) },
                    modifier = Modifier.padding(bottom = 12.dp)
                ) {
                    Column(Modifier.padding(16.dp)) {
                        Text(p.name, style = MaterialTheme.typography.titleMedium)
                        Text("Tags: ${p.tags}")
                        Text("Rating: ${p.rating}★")
                    }
                }
            }
        }
        Button(onClick = onAdd, modifier = Modifier.padding(16.dp)) { Text("Add Place") }
    }
}

@Preview(showBackground = true)
@Composable
private fun PlacesListPreview() {
    MaterialTheme { PlacesListScreen(onOpenDetails = {}, onAdd = {}) }
}
