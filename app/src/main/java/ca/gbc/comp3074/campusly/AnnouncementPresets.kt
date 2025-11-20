package ca.gbc.comp3074.campusly

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector

data class CategoryPreset(
    val category: String,
    val icon: ImageVector,
    val color: Color
)

val AnnouncementCategories = listOf(
    CategoryPreset(
        category = "Campus Services",
        icon = Icons.Default.SupportAgent,
        color = Color(0xFF1976D2)
    ),
    CategoryPreset(
        category = "Events & Activities",
        icon = Icons.Default.Event,
        color = Color(0xFF8E24AA)
    ),
    CategoryPreset(
        category = "Clubs & Organizations",
        icon = Icons.Default.Groups,
        color = Color(0xFF43A047)
    ),
    CategoryPreset(
        category = "Deadlines & Reminders",
        icon = Icons.Default.Alarm,
        color = Color(0xFFFF9800)
    ),
    CategoryPreset(
        category = "Alerts & Notices",
        icon = Icons.Default.Warning,
        color = Color(0xFFD32F2F)
    ),
    CategoryPreset(
        category = "Student Life",
        icon = Icons.Default.School,
        color = Color(0xFF00796B)
    )
)

fun presetForCategory(category: String): CategoryPreset =
    AnnouncementCategories.find { it.category == category } ?: AnnouncementCategories.first()
