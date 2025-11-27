package ca.gbc.comp3074.campusly

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverters

@Entity(tableName = "places")
@TypeConverters(Converters::class)
data class PlaceEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0L,
    val name: String,
    val campus: String,
    val description: String,
    val rating: Double,
    val tags: List<String>,
    val isFeatured: Boolean,
    val imageUri: String?
)
