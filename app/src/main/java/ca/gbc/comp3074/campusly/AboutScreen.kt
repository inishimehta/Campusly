package ca.gbc.comp3074.campusly

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp

@Composable
fun AboutScreen(onBack: () -> Unit = {}) {
    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text("Campusly", style = MaterialTheme.typography.headlineSmall)
        Text("G-27 • COMP3074 • Fall 2025")
        Text("Team: Nishi Bipin Mehta, Manvi Prakash, Rashi Bedi, Hetvi Patel")
        Text("Prototype UI built with Jetpack Compose")
    }
}

@Preview(showBackground = true)
@Composable
private fun AboutPreview() {
    MaterialTheme { AboutScreen() }
}
