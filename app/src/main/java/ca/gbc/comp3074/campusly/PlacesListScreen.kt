package ca.gbc.comp3074.campusly

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items // ✨ EDITED – used items() instead of manual index
import androidx.compose.material.icons.Icons // ✨ EDITED – added icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment // ✨ EDITED – for button alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight // ✨ EDITED – styling titles
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import ca.gbc.comp3074.campusly.data.CampuslyFakeData

data class PlaceUi(val id: Long, val name: String, val tags: String, val rating: Int)

@Composable
fun PlacesListScreen(
    onOpenDetails: (Long) -> Unit,
    onAdd: () -> Unit
) {
    val places = CampuslyFakeData.places

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
    ) {

        Text(
            text = "Campus Places",
            style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
            modifier = Modifier.padding(vertical = 16.dp)
        )

        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth(),
            contentPadding = PaddingValues(bottom = 16.dp)
        ) {
            items(places) { p ->
                ElevatedCard(
                    onClick = { onOpenDetails(p.id) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp)
                ) {
                    Column(Modifier.padding(16.dp)) {

                        Image(
                            painter = painterResource(id = p.imageResId),
                            contentDescription = p.name,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(160.dp)
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = p.name,
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold)
                        )

                        Text(
                            text = "Tags: ${p.tags}",
                            style = MaterialTheme.typography.bodyMedium,
                            modifier = Modifier.padding(top = 2.dp)
                        )

                        Text(
                            text = "Rating: ${p.rating} ★",
                            style = MaterialTheme.typography.bodySmall,
                            modifier = Modifier.padding(top = 2.dp)
                        )
                    }
                }
            }
        }


        Button(
            onClick = onAdd,
            modifier = Modifier
                .align(Alignment.End)
                .padding(bottom = 16.dp)
        ) {
            Icon(Icons.Default.Add, contentDescription = "Add Place")
            Spacer(Modifier.width(6.dp))
            Text("Add Place")
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun PlacesListPreview() {
    MaterialTheme {
        PlacesListScreen(onOpenDetails = {}, onAdd = {})
    }
}
