package ca.gbc.comp3074.campusly

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

enum class TaskStatus { INCOMPLETE, STARTED, COMPLETE }
enum class TaskType { GROUP, PERSONAL }

@Entity(
    tableName = "group_tasks",
    indices = [Index("groupId"), Index("status"), Index("dueAt")]
)
data class GroupTaskEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val groupId: Int,
    val type: TaskType = TaskType.GROUP,
    val title: String,
    val description: String = "",
    val assigneeName: String? = null, // simple for now
    val status: TaskStatus = TaskStatus.INCOMPLETE,
    val labels: String = "", // comma-separated
    val dueAt: Long? = null,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
