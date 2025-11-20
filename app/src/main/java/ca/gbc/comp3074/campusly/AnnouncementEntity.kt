package ca.gbc.comp3074.campusly

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "announcements")
data class AnnouncementEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val title: String,
    val message: String,
    val link: String = "",    // <---- DEFAULT VALUE ADDED
    val isSeeded: Boolean = false
)

