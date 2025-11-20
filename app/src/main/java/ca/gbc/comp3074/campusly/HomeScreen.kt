package ca.gbc.comp3074.campusly

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.platform.LocalContext
import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
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
    onAbout: () -> Unit,
    onNavigateHome: () -> Unit
) {
    val context = LocalContext.current

    fun openUrl(url: String) {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
        context.startActivity(intent)
    }

    // 🔥 List of rotating tips
    val tips = listOf(
        "Remember to check your campus email daily for important updates!",
        "Join a study group to make learning easier and more fun!",
        "Stay hydrated—use the refill stations around campus!",
        "Visit the library early to find quiet study spaces.",
        "Attend campus events to meet new people and grow your network.",
        "Take short breaks during studying to stay productive.",
        "Use office hours to ask professors questions!"
    )

    // 🔥 Pick a new random tip every time HomeScreen loads
    val tipOfTheDay = remember { tips.random() }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {

        CampuslyTopBar(onTitleClick = onAbout)

        // ⭐ Welcome Card with rotating tip
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

                // 🔥 Dynamic tip
                Text(
                    tipOfTheDay,
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
                    iconBackgroundColor = Color(0xFF43A047)
                )

                FeatureCard(
                    title = "Events",
                    icon = Icons.Default.DateRange,
                    desc = "Discover upcoming campus events and activities",
                    onClick = onEvents,
                    modifier = Modifier.weight(1f)
                        .width(150.dp)
                        .height(200.dp),
                    iconBackgroundColor = Color(0xFF8E24AA)
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
                    iconBackgroundColor = Color(0xFF1E88E5)
                )

                FeatureCard(
                    title = "Announcements",
                    icon = Icons.Default.Campaign,
                    desc = "Stay updated with important campus news",
                    onClick = onAnnouncements,
                    modifier = Modifier.weight(1f)
                        .width(150.dp)
                        .height(200.dp),
                    iconBackgroundColor = Color(0xFFFB8C00)
                )
            }

        }

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
                backgroundColor = Color(0xFFBFDBFE)
            )
            QuickLink(
                "Clubs",
                Icons.Default.Star,
                onClick = { openUrl("https://www.georgebrown.ca/current-students/campus-activities-clubs/student-clubs") },
                backgroundColor = Color(0xFFBFDBFE)
            )
            QuickLink(
                "Services",
                Icons.Default.HeadsetMic,
                onClick = { openUrl("https://www.georgebrown.ca/current-students/services") },
                backgroundColor = Color(0xFFBFDBFE)
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
        modifier = modifier.height(130.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
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
    backgroundColor: Color = Color(0xFFE3F2FD),
    iconTint: Color = Color(0xFF1F2937)
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
                Icon(icon, contentDescription = title, tint = iconTint)
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
