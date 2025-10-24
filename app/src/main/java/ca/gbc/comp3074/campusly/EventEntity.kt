package ca.gbc.comp3074.campusly

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "events")
data class EventEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val location: String,
    val dateTime: String,
    val description: String,
    val rsvp: Boolean = false
)
