package ca.gbc.comp3074.campusly

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(
    entities = [
        StudyGroupEntity::class,
        EventEntity::class,
        GroupAnnouncementEntity::class,
        GroupTaskEntity::class,
        AnnouncementEntity::class
    ],
    version = 8,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {

    // Existing DAOs
    abstract fun studyGroupDao(): StudyGroupDao
    abstract fun eventDao(): EventDao

    // New DAOs for the Study Group Hub
    abstract fun groupAnnouncementDao(): GroupAnnouncementDao
    abstract fun groupTaskDao(): GroupTaskDao

    //New DAO for Announcements
    abstract fun announcementDao(): AnnouncementDao


    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "campusly_database"
                )
                    // OK for now while iterating; replace with proper Migration when stable
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
