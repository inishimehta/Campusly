package ca.gbc.comp3074.campusly

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "group_announcements",
    indices = [Index("groupId")]
)
data class GroupAnnouncementEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val groupId: Int,
    val title: String,
    val body: String,
    val pinned: Boolean = false,
    val createdAt: Long = System.currentTimeMillis(),
    val editedAt: Long? = null
)
