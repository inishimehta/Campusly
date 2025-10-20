package ca.gbc.comp3074.campusly

import androidx.room.Database
import androidx.room.RoomDatabase

@Database(entities = [StudyGroupEntity::class], version = 1)
abstract class AppDatabase : RoomDatabase() {
    abstract fun studyGroupDao(): StudyGroupDao
}
