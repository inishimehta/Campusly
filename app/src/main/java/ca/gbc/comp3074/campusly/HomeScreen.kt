package ca.gbc.comp3074.campusly

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.HeadsetMic
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.Campaign
import androidx.compose.material.icons.filled.Star

@Composable
fun HomeScreen(
    onPlaces: () -> Unit,
    onEvents: () -> Unit,
    onStudyGroups: () -> Unit,
    onAnnouncements: () -> Unit,
    onAbout: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Top bar
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                "Campusly",
                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
            )
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Icon(imageVector = Icons.Default.Notifications, contentDescription = "Notifications")
                Icon(imageVector = Icons.Default.Person, contentDescription = "Profile")
            }
        }

        // Welcome Card
        Card(
            colors = CardDefaults.cardColors(containerColor = Color(0xFF1E88E5)),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    "Welcome, Student! 👋",
                    color = Color.White,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    "💡 Tip of the Day",
                    color = Color.Yellow,
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    "Remember to check your campus email daily for important updates!",
                    color = Color.White
                )
            }
        }

        // Feature Grid
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                FeatureCard(
                    "Places",
                    Icons.Default.Place,
                    "Find campus locations and navigate easily",
                    onClick = onPlaces,
                    modifier = Modifier.weight(1f)
                )
                FeatureCard(
                    "Events",
                    Icons.Default.DateRange,
                    "Discover upcoming campus events and activities",
                    onClick = onEvents,
                    modifier = Modifier.weight(1f)
                )
            }
            Row(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                FeatureCard(
                    "Study Groups",
                    Icons.Default.People,
                    "Join or create study groups with classmates",
                    onClick = onStudyGroups,
                    modifier = Modifier.weight(1f)
                )
                FeatureCard(
                    "Announcements",
                    Icons.Default.Campaign,
                    "Stay updated with important campus news",
                    onClick = onAnnouncements,
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // Quick Links
        Text(
            "Quick Links",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            QuickLink("Maps", Icons.Default.Map)
            QuickLink("Clubs", Icons.Default.Star)
            QuickLink("Services", Icons.Default.HeadsetMic)
        }
    }
}

@Composable
fun FeatureCard(
    title: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    desc: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        onClick = onClick,
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFFF5F5F5))
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(icon, contentDescription = title, tint = Color.Black, modifier = Modifier.size(32.dp))
            Spacer(modifier = Modifier.height(8.dp))
            Text(title, fontWeight = FontWeight.Bold)
            Text(desc, style = MaterialTheme.typography.bodySmall)
        }
    }
}

@Composable
fun QuickLink(title: String, icon: androidx.compose.ui.graphics.vector.ImageVector) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Card(
            shape = RoundedCornerShape(50),
            colors = CardDefaults.cardColors(containerColor = Color(0xFFE3F2FD)),
            modifier = Modifier.size(60.dp)
        ) {
            Box(contentAlignment = Alignment.Center, modifier = Modifier.fillMaxSize()) {
                Icon(icon, contentDescription = title, tint = Color.Black)
            }
        }
        Spacer(modifier = Modifier.height(4.dp))
        Text(title, style = MaterialTheme.typography.bodySmall)
    }
}

@Preview(showBackground = true)
@Composable
fun HomePreview() {
    MaterialTheme {
        HomeScreen(onPlaces = {}, onEvents = {}, onStudyGroups = {}, onAnnouncements = {}, onAbout = {})
    }
}
