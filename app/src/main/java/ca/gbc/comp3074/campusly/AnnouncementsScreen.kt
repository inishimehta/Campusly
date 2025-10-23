package ca.gbc.comp3074.campusly

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AnnouncementsScreen(onBack: () -> Unit) {

    // Today's announcements with icons and colors
    val todaysAnnouncements = listOf(
        TodayAnnouncement("Free pizza lunch at Student Commons today at noon!", Icons.Default.Restaurant, Color(0xFFE91E63)),
        TodayAnnouncement("Campus WiFi has been fixed, full service restored.", Icons.Default.Wifi, Color(0xFF4CAF50)),
        TodayAnnouncement("New club registration desk opens at 2pm—no appointment needed.", Icons.Default.Groups, Color(0xFF9C27B0)),
        TodayAnnouncement("Reminder: Library closes at 6pm due to staff meeting.", Icons.Default.MenuBook, Color(0xFF2196F3)),
        TodayAnnouncement("Final call for peer tutoring sign-up! Deadline today.", Icons.Default.School, Color(0xFFFF9800)),
        TodayAnnouncement("Blood donation drive in gym—walk-ins welcome until 3pm!", Icons.Default.Favorite, Color(0xFFD32F2F)),
        TodayAnnouncement("Career Services hosting resume review drop-ins, Room 206, 11am–3pm.", Icons.Default.Work, Color(0xFF1976D2)),
        TodayAnnouncement("Photography contest voting open on the Campusly app!", Icons.Default.PhotoCamera, Color(0xFF7C4DFF)),
        TodayAnnouncement("Mental Wellness seminar at 2pm, Student Centre.", Icons.Default.HealthAndSafety, Color(0xFF2E7D32)),
//        TodayAnnouncement("New eco-bottle refill station installed in Science Bldg.", Icons.Default.Water, Color(0xFF00BCD4)),
//        TodayAnnouncement("Student Council Elections—vote by 5pm today!", Icons.Default.HowToVote, Color(0xFF455A64)),
//        TodayAnnouncement("Hot chocolate available outside the main entrance 9–11am.", Icons.Default.LocalCafe, Color(0xFF6D4C41)),
//        TodayAnnouncement("Basketball game tonight! Free for first-year students.", Icons.Default.SportsBasketball, Color(0xFFF57C00)),
//        TodayAnnouncement("Sign-ups open for coding hackathon this weekend.", Icons.Default.Code, Color(0xFF0288D1)),
//        TodayAnnouncement("Lost & Found pop-up booth—see Reception for details.", Icons.Default.Search, Color(0xFF5E35B1))
//    )
    )


    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Today's Campus Announcements") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        },
        containerColor = Color(0xFFF6F6F6)
    ) { padding ->
        LazyColumn(
            contentPadding = padding,
            verticalArrangement = Arrangement.spacedBy(14.dp),
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp) // Safe to keep some padding for look
        ) {
            items(todaysAnnouncements) { announcement ->
                AnnouncementCardWithIcon(announcement = announcement)
            }
        }
    }
}

data class TodayAnnouncement(
    val title: String,
    val icon: ImageVector,
    val color: Color
)

@Composable
fun AnnouncementCardWithIcon(announcement: TodayAnnouncement) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(18.dp)
        ) {
            // Icon in colored circle
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = announcement.color),
                modifier = Modifier.size(48.dp)
            ) {
                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier.fillMaxSize()
                ) {
                    Icon(
                        imageVector = announcement.icon,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(26.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.width(16.dp))

            // Text content
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = announcement.title,
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp,
                    color = Color(0xFF2160B0)
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "Posted today • See Student Life for details.",
                    color = Color.Gray,
                    fontSize = 14.sp
                )
            }
        }
    }
}
