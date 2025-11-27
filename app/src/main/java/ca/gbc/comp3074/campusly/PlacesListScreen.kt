package ca.gbc.comp3074.campusly

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage

// Green theme accent
private val GreenPrimary = Color(0xFF43A047)

@Composable
fun PlacesListScreen(
    viewModel: PlacesViewModel,
    onOpenDetails: (Long) -> Unit,
    onAdd: () -> Unit,
    onBack: () -> Unit
) {
    val places by viewModel.places.collectAsState(initial = emptyList())
    PlacesListScreenContent(
        places = places,
        onOpenDetails = onOpenDetails,
        onAdd = onAdd,
        onBack = onBack
    )
}

@Composable
private fun PlacesListScreenContent(
    places: List<PlaceEntity>,
    onOpenDetails: (Long) -> Unit,
    onAdd: () -> Unit,
    onBack: () -> Unit
) {
    var searchText by remember { mutableStateOf("") }
    var expandedCampus by remember { mutableStateOf(false) }
    var selectedCampus by remember { mutableStateOf("All Campuses") }

    // ⭐ FIXED FILTERING LOGIC ⭐
    val filteredPlaces = places.filter { p ->
        (selectedCampus == "All Campuses" ||
                p.campus.contains(selectedCampus, ignoreCase = true)) &&
                (searchText.isBlank() ||
                        p.name.contains(searchText, ignoreCase = true) ||
                        p.tags.any { it.contains(searchText, ignoreCase = true) })
    }

    val featured = filteredPlaces.firstOrNull { it.isFeatured }
    val others = filteredPlaces.filter { !it.isFeatured }

    Box(Modifier.fillMaxSize()) {

        Column(Modifier.padding(horizontal = 16.dp)) {

            // ---------------- HEADER ----------------
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(top = 16.dp, bottom = 10.dp)
            ) {
                IconButton(onClick = onBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                }
                Text(
                    "Places",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold
                )
            }

            // ---------------- SEARCH BAR ----------------
            Row(verticalAlignment = Alignment.CenterVertically) {

                OutlinedTextField(
                    value = searchText,
                    onValueChange = { searchText = it },
                    leadingIcon = { Icon(Icons.Default.Search, null) },
                    placeholder = { Text("Search places…") },
                    modifier = Modifier
                        .weight(1f)
                        .height(48.dp),
                    shape = RoundedCornerShape(26.dp),
                    singleLine = true
                )

                Spacer(Modifier.width(10.dp))

                FilledTonalIconButton(
                    onClick = { expandedCampus = true },
                    colors = IconButtonDefaults.filledTonalIconButtonColors(
                        containerColor = Color(0xFFEEEEEE)
                    )
                ) {
                    Icon(Icons.Default.FilterList, "Filter")
                }

                DropdownMenu(
                    expanded = expandedCampus,
                    onDismissRequest = { expandedCampus = false }
                ) {
                    listOf("All Campuses", "Casa Loma", "St James", "Waterfront").forEach { campus ->
                        DropdownMenuItem(
                            text = { Text(campus) },
                            onClick = {
                                selectedCampus = campus
                                expandedCampus = false
                            }
                        )
                    }
                }
            }

            Spacer(Modifier.height(18.dp))

            // ---------------- FEATURED CARD ----------------
            featured?.let { p ->
                Text("Featured", style = MaterialTheme.typography.titleMedium)
                Spacer(Modifier.height(10.dp))

                ElevatedCard(
                    onClick = { onOpenDetails(p.id) },
                    shape = RoundedCornerShape(24.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column {
                        AsyncImage(
                            model = p.imageUri,
                            contentDescription = p.name,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(200.dp)
                                .clip(RoundedCornerShape(24.dp)),
                            contentScale = ContentScale.Crop
                        )

                        Column(Modifier.padding(14.dp)) {
                            Text(
                                "★ Featured: ${p.name}",
                                fontWeight = FontWeight.Bold,
                                color = GreenPrimary
                            )
                            Text(
                                p.description,
                                maxLines = 2,
                                color = Color.Black.copy(alpha = 0.65f)
                            )
                        }
                    }
                }
            }

            Spacer(Modifier.height(22.dp))
            Text("All Places", style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(12.dp))

            // ---------------- LIST ----------------
            LazyColumn(Modifier.weight(1f)) {
                items(others) { p ->

                    ElevatedCard(
                        onClick = { onOpenDetails(p.id) },
                        shape = RoundedCornerShape(20.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 8.dp)
                    ) {
                        Row(Modifier.padding(12.dp)) {

                            AsyncImage(
                                model = p.imageUri ?: R.drawable.placeholder_image,
                                contentDescription = p.name,
                                modifier = Modifier
                                    .size(95.dp)
                                    .clip(RoundedCornerShape(16.dp)),
                                contentScale = ContentScale.Crop
                            )

                            Spacer(Modifier.width(12.dp))

                            Column(Modifier.weight(1f)) {

                                Text(p.name, fontWeight = FontWeight.SemiBold)

                                Spacer(Modifier.height(4.dp))

                                Text(
                                    p.description,
                                    maxLines = 2,
                                    color = Color.Black.copy(alpha = 0.6f)
                                )

                                Spacer(Modifier.height(6.dp))

                                // Tags
                                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    p.tags.take(3).forEach { tag ->
                                        Box(
                                            modifier = Modifier
                                                .clip(RoundedCornerShape(8.dp))
                                                .background(GreenPrimary.copy(alpha = 0.15f))
                                                .padding(horizontal = 8.dp, vertical = 4.dp)
                                        ) {
                                            Text(
                                                tag,
                                                color = GreenPrimary,
                                                style = MaterialTheme.typography.bodySmall
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // ---------------- ADD BUTTON ----------------
        FloatingActionButton(
            onClick = onAdd,
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(16.dp),
            containerColor = GreenPrimary,
            contentColor = Color.White,
            shape = CircleShape
        ) {
            Icon(Icons.Default.Add, "Add")
        }
    }
}
