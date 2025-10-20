package ca.gbc.comp3074.campusly

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue

@Composable
fun AppRoot() {
    var currentScreen by remember { mutableStateOf("home") }

    val navigateHome = { currentScreen = "home" }
    val navigateToAbout = { currentScreen = "about" }

    when (currentScreen) {
        "home" -> HomeScreen(
            onNavigateHome = navigateHome,
            onPlaces = { /* ... */ },
            onEvents = { /* ... */ },
            onStudyGroups = { /* ... */ },
            onAnnouncements = { /* ... */ },
            onAbout = navigateToAbout
        )
        "about" -> AboutScreen(
            onBack = { currentScreen = "home" },
            onNavigateHome = navigateHome
        )
    }
}
