package ca.gbc.comp3074.campusly

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface GroupAnnouncementDao {
    @Query("""
        SELECT * FROM group_announcements 
        WHERE groupId = :groupId 
        ORDER BY pinned DESC, createdAt DESC
    """)
    fun streamByGroup(groupId: Int): Flow<List<GroupAnnouncementEntity>>

    @Insert
    suspend fun insert(a: GroupAnnouncementEntity): Long

    @Update
    suspend fun update(a: GroupAnnouncementEntity)

    @Query("UPDATE group_announcements SET pinned = :pinned WHERE id = :id")
    suspend fun togglePin(id: Int, pinned: Boolean)

    @Query("DELETE FROM group_announcements WHERE id = :id")
    suspend fun delete(id: Int)
}
