package ca.gbc.comp3074.campusly

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface StudyGroupDao {
    @Query("SELECT * FROM study_groups")
    fun getAllGroups(): Flow<List<StudyGroupEntity>>

    @Insert
    suspend fun insertGroup(group: StudyGroupEntity): Long

    @Query("DELETE FROM study_groups WHERE id = :id")
    suspend fun deleteGroupById(id: Int)

    // For seeding: return table count
    @Query("SELECT COUNT(*) FROM study_groups")
    suspend fun count(): Int
}
