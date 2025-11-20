package ca.gbc.comp3074.campusly

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface AnnouncementDao {

    @Query("SELECT * FROM announcements ORDER BY id DESC")
    fun getAllAnnouncements(): Flow<List<AnnouncementEntity>>

    @Insert
    suspend fun insertAnnouncement(entity: AnnouncementEntity)

    @Update
    suspend fun updateAnnouncement(entity: AnnouncementEntity)

    @Delete
    suspend fun deleteAnnouncement(entity: AnnouncementEntity)
}
