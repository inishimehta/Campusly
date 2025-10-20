package ca.gbc.comp3074.campusly

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "study_groups")
data class StudyGroupEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val name: String,
    val description: String
)
