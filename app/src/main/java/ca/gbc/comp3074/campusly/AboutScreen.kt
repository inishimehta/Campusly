package ca.gbc.comp3074.campusly

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun AboutScreen(onBack: () -> Unit = {}) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // App Title - Bold and Centered
        Text(
            "Campusly",
            style = MaterialTheme.typography.headlineSmall.copy(
                fontWeight = androidx.compose.ui.text.font.FontWeight.Bold
            ),
            color = MaterialTheme.colorScheme.primary,
            modifier = Modifier.fillMaxWidth(),
        )

        // Short Description - Centered
        Text(
            "Your student companion, so you don't waste time wondering where to go. Camously helps students discover events, places, and resources. All in one app!",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f),
            lineHeight = 20.sp,
            modifier = Modifier.fillMaxWidth(),
        )
        // Meet Our Team Card
        Card(
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)),
            modifier = Modifier.fillMaxWidth(),
            elevation = CardDefaults.cardElevation(6.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text("Meet Our Team", style = MaterialTheme.typography.titleMedium, fontSize = 20.sp)
                Divider(modifier = Modifier.padding(vertical = 4.dp))
                Text("• Nishi Bipin Mehta • ( 101514172 )", style = MaterialTheme.typography.bodyMedium)
                Text("• Manvi Prakash • ( 101488862 )", style = MaterialTheme.typography.bodyMedium)
                Text("• Rashi Bedi • ( 101488543 )", style = MaterialTheme.typography.bodyMedium)
                Text("• Hetvi Patel • ( 101508910 )", style = MaterialTheme.typography.bodyMedium)
            }
        }

        // Course Information Card
        Card(
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondary.copy(alpha = 0.1f)),
            modifier = Modifier.fillMaxWidth(),
            elevation = CardDefaults.cardElevation(6.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text("Course Information", style = MaterialTheme.typography.titleMedium, fontSize = 20.sp)
                Divider(modifier = Modifier.padding(vertical = 4.dp))
                Text("Group: G-27", style = MaterialTheme.typography.bodyMedium)
                Text("Course: COMP3074", style = MaterialTheme.typography.bodyMedium)
                Text("Semester: Fall 2025", style = MaterialTheme.typography.bodyMedium)
                Text("Prototype UI built with Jetpack Compose", style = MaterialTheme.typography.bodyMedium)
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun AboutPreview() {
    MaterialTheme { AboutScreen() }
}