package ca.gbc.comp3074.campusly

import androidx.room.TypeConverter

class Converters {

    // List<String> <-> CSV
    @TypeConverter
    fun fromList(value: List<String>?): String {
        return value?.joinToString(",") ?: ""
    }

    @TypeConverter
    fun toList(value: String?): List<String> {
        return value?.split(",")?.map { it.trim() }?.filter { it.isNotEmpty() } ?: emptyList()
    }

}
