package ca.gbc.comp3074.campusly

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface GroupTaskDao {
    @Query("""
        SELECT * FROM group_tasks 
        WHERE groupId = :groupId
        AND (:status IS NULL OR status = :status)
        ORDER BY 
            CASE status 
                WHEN 'INCOMPLETE' THEN 0 
                WHEN 'STARTED' THEN 1 
                ELSE 2 
            END,
            COALESCE(dueAt, 9223372036854775807)
    """)
    fun streamByGroup(
        groupId: Int,
        status: TaskStatus? = null
    ): Flow<List<GroupTaskEntity>>

    @Insert
    suspend fun insert(t: GroupTaskEntity): Long

    @Update
    suspend fun update(t: GroupTaskEntity)

    @Query("UPDATE group_tasks SET status = :status, updatedAt = :now WHERE id = :id")
    suspend fun setStatus(id: Int, status: TaskStatus, now: Long = System.currentTimeMillis())

    @Query("DELETE FROM group_tasks WHERE id = :id")
    suspend fun delete(id: Int)

    @Query("""
        SELECT 
            SUM(CASE WHEN status = 'COMPLETE' THEN 1 ELSE 0 END) AS done,
            COUNT(*) AS total
        FROM group_tasks WHERE groupId = :groupId
    """)
    fun progress(groupId: Int): Flow<ProgressRow>
}

data class ProgressRow(val done: Int, val total: Int)
