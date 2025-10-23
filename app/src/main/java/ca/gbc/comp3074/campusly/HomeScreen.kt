package ca.gbc.comp3074.campusly

import androidx.compose.foundation.clickable
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
import androidx.compose.ui.platform.LocalContext
import ca.gbc.comp3074.campusly.CampuslyTopBar
import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background

@Composable
fun HomeScreen(
    onPlaces: () -> Unit,
    onEvents: () -> Unit,
    onStudyGroups: () -> Unit,
    onAnnouncements: () -> Unit,
    onAbout: () -> Unit,
    onNavigateHome: () -> Unit
) {
    val context = LocalContext.current

    fun openUrl(url: String) {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
        context.startActivity(intent)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Top bar
//        Row(
//            modifier = Modifier.fillMaxWidth(),
//            horizontalArrangement = Arrangement.SpaceBetween,
//            verticalAlignment = Alignment.CenterVertically
//        ) {
//            Text(
//                "Campusly",
//                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
//                modifier = Modifier.clickable { onAbout() }
//            )
//            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
//                Icon(imageVector = Icons.Default.Notifications, contentDescription = "Notifications")
//                Icon(imageVector = Icons.Default.Person, contentDescription = "Profile")
//            }
//        }
        CampuslyTopBar(onTitleClick = onNavigateHome)

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
                    title = "Places",
                    icon = Icons.Default.Place,
                    desc = "Find campus locations and navigate easily",
                    onClick = onPlaces,
                    modifier = Modifier.weight(1f)
                        .width(150.dp)
                        .height(200.dp),
                    iconBackgroundColor = Color(0xFF1E88E5) // Blue
                )

                FeatureCard(
                    title = "Events",
                    icon = Icons.Default.DateRange,
                    desc = "Discover upcoming campus events and activities",
                    onClick = onEvents,
                    modifier = Modifier.weight(1f)
                        .width(150.dp)
                        .height(200.dp),
                    iconBackgroundColor = Color(0xFF43A047) // Green
                )
            }

            Row(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                FeatureCard(
                    title = "Study Groups",
                    icon = Icons.Default.People,
                    desc = "Join or create study groups with classmates",
                    onClick = onStudyGroups,
                    modifier = Modifier.weight(1f)
                        .width(150.dp)
                        .height(200.dp),
                    iconBackgroundColor = Color(0xFF8E24AA) // Purple
                )

                FeatureCard(
                    title = "Announcements",
                    icon = Icons.Default.Campaign,
                    desc = "Stay updated with important campus news",
                    onClick = onAnnouncements,
                    modifier = Modifier.weight(1f)
                        .width(150.dp)
                        .height(200.dp),
                    iconBackgroundColor = Color(0xFFFB8C00) // Orange
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
            QuickLink(
                "Maps",
                Icons.Default.Map,
                onClick = { openUrl("https://www.georgebrown.ca/about/campuses-locations") },
                backgroundColor = Color(0xFFFFB74D)
            )
            QuickLink(
                "Clubs",
                Icons.Default.Star,
                onClick = { openUrl("https://www.georgebrown.ca/current-students/campus-activities-clubs/student-clubs") },
                backgroundColor = Color(0xFFBA68C8)
            )
            QuickLink(
                "Services",
                Icons.Default.HeadsetMic,
                onClick = { openUrl("https://www.georgebrown.ca/current-students/services") },
                backgroundColor = Color(0xFFE57373)
            )
        }

    }
    }


@Composable
fun FeatureCard(
    title: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    desc: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    iconBackgroundColor: Color = Color(0xFFE3F2FD)

) {
    Card(
        onClick = onClick,
        modifier = modifier
            .height(130.dp), // makes it rectangular
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Circle behind icon
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .background(color = iconBackgroundColor, shape = RoundedCornerShape(50)),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = title, tint = Color.White, modifier = Modifier.size(24.dp))
            }

            Spacer(modifier = Modifier.height(8.dp))
            Text(title, fontWeight = FontWeight.Bold)
            Text(desc, style = MaterialTheme.typography.bodySmall, color = Color.Gray, lineHeight = 14.sp)
        }
    }
}

@Composable
fun QuickLink(
    title: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    onClick: () -> Unit,
    backgroundColor: Color = Color(0xFFE3F2FD)
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.clickable(onClick = onClick)
    ) {
        Card(
            shape = RoundedCornerShape(50),
            colors = CardDefaults.cardColors(containerColor = backgroundColor),
            modifier = Modifier.size(60.dp)
        ) {
            Box(contentAlignment = Alignment.Center, modifier = Modifier.fillMaxSize()) {
                Icon(icon, contentDescription = title, tint = Color.White)
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
        HomeScreen(
            onPlaces = {},
            onEvents = {},
            onStudyGroups = {},
            onAnnouncements = {},
            onAbout = {},
            onNavigateHome = {}
        )
    }
}
