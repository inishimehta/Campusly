package ca.gbc.comp3074.campusly

import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ca.gbc.comp3074.campusly.data.CampuslyFakeData

@Composable
fun PlaceDetailsScreen(
    id: Long,
    onEdit: () -> Unit = {},
    onBack: () -> Unit = {},
    onNavigateToPlace: (Long) -> Unit

) {

    val place = CampuslyFakeData.places.find { it.id == id }

    if (place == null) {
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text("Place not found.", style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(8.dp))
            Button(onClick = onBack) { Text("Back") }
        }
        return
    }

    var isFavorite by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
    ) {

        Box(modifier = Modifier.fillMaxWidth()) {

            Image(
                painter = painterResource(id = place.imageResId),
                contentDescription = place.name,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp)
                    .clip(RoundedCornerShape(12.dp)),
                contentScale = ContentScale.Crop
            )

            IconButton(
                onClick = { isFavorite = !isFavorite },
                modifier = Modifier.align(Alignment.TopEnd)
            ) {
                Icon(
                    imageVector = if (isFavorite) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                    contentDescription = "Favorite",
                    tint = if (isFavorite) Color.Red else Color.White
                )
            }
        }

        Spacer(Modifier.height(16.dp))


        Text(
            text = place.name,
            style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold)
        )

        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Default.Star, contentDescription = "Rating", tint = Color(0xFFFFD700))
            Text("${place.rating}.0 (120 reviews)", fontSize = 14.sp, modifier = Modifier.padding(start = 4.dp))
        }

        Spacer(Modifier.height(8.dp))


        Text(
            text = when (place.id) {
                1L -> "📍 180 Student Centre Rd, Toronto"
                2L -> "📍 160 Kendal Ave, Toronto"
                3L -> "📍 50 Campus Café Lane, Toronto"
                else -> "📍 Unknown Address"
            },
            fontSize = 14.sp
        )

        Text("🏷️ Tags: ${place.tags}", fontSize = 14.sp)

        Text(
            text = when (place.id) { // ✨ EDITED – dynamic phone
                1L -> "☎️ (416) 555-0111"
                2L -> "☎️ (416) 555-0101"
                3L -> "☎️ (416) 555-0123"
                else -> "☎️ N/A"
            },
            fontSize = 14.sp
        )

        Spacer(Modifier.height(16.dp))

        Text(
            text = when (place.id) {
                1L -> "The Student Centre is the heart of campus social life, offering a welcoming environment for students to connect, relax, and engage in various activities. " +
                        "The building houses multiple lounges, club offices, and event spaces where students can organize and attend workshops, meetings, and social gatherings. " +
                        "It also provides essential student services, including helpdesks, information centers, and study nooks. " +
                        "With modern facilities, comfortable seating, and vibrant communal areas, the Student Centre fosters collaboration, creativity, and a strong sense of community on campus."
                2L -> "The Central Library is the heart of academic life, offering quiet study spaces, collaborative areas, and access to both physical and digital resources. " +
                        "With over two hundred thousand books, extensive archives, and state-of-the-art technology, it serves as a vital hub for students and faculty alike. " +
                        "The building features modern architecture with plenty of natural light, comfortable seating, and spaces designed for focused work or group projects."
                3L -> "The Campus Café is a cozy and vibrant spot for students, faculty, and visitors to recharge between classes. " +
                        "Known for its quality coffee, fresh snacks, and relaxing atmosphere, it offers both indoor and outdoor seating with comfortable tables, lounge chairs, and study corners. " +
                        "The café serves as a hub for casual meetings, group discussions, and solo study sessions, providing a friendly environment for conversation or quiet focus. " +
                        "With its warm ambiance, free Wi-Fi, and varied menu, the Campus Café is an ideal place to relax, socialize, or fuel up for a busy day on campus."
                else -> "Description not available."
            },
            style = MaterialTheme.typography.bodyMedium,
            textAlign = TextAlign.Justify
        )

        Spacer(Modifier.height(20.dp))

        Row(
            horizontalArrangement = Arrangement.SpaceBetween,
            modifier = Modifier.fillMaxWidth()
        ) {
            OutlinedButton(onClick = { /* TODO: open Google Maps */ }) {
                Icon(Icons.Default.Directions, contentDescription = null)
                Spacer(Modifier.width(4.dp))
                Text("Directions")
            }
            OutlinedButton(onClick = { /* TODO: share */ }) {
                Icon(Icons.Default.Share, contentDescription = null)
                Spacer(Modifier.width(4.dp))
                Text("Share")
            }
        }

        Spacer(Modifier.height(8.dp))

        Row(
            horizontalArrangement = Arrangement.SpaceBetween,
            modifier = Modifier.fillMaxWidth()
        ) {
            OutlinedButton(onClick = { /* TODO: open rating screen */ }) {
                Icon(Icons.Default.StarBorder, contentDescription = null)
                Spacer(Modifier.width(4.dp))
                Text("Rate")
            }
            OutlinedButton(onClick = { /* TODO: open full map */ }) {
                Icon(Icons.Default.Map, contentDescription = null)
                Spacer(Modifier.width(4.dp))
                Text("View Full Map")
            }
        }

        Spacer(Modifier.height(24.dp))


        Text(
            "Similar Places Nearby",
            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold)
        )

        Spacer(Modifier.height(8.dp))

        LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            items(CampuslyFakeData.places.filter { it.id != place.id }) { nearby ->
                Card(
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .width(160.dp)
                        .clickable { onNavigateToPlace(nearby.id)  }

                ) {
                    Column {
                        Image(
                            painter = painterResource(id = nearby.imageResId),
                            contentDescription = nearby.name,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(100.dp),
                            contentScale = ContentScale.Crop
                        )
                        Text(
                            text = nearby.name,
                            modifier = Modifier.padding(8.dp),
                            style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium)
                        )
                    }
                }
            }
        }

        Spacer(Modifier.height(20.dp))

        OutlinedButton(onClick = onBack, modifier = Modifier.fillMaxWidth()) {
            Text("Back")
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun PlaceDetailsPreview() {
    MaterialTheme {
        //PlaceDetailsScreen(id = 2)
    }
}
