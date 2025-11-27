package ca.gbc.comp3074.campusly

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface EventDao {

    @Query("SELECT * FROM events ORDER BY date, time")
    fun getAllEvents(): Flow<List<EventEntity>>

    @Query("SELECT * FROM events WHERE id = :id LIMIT 1")
    fun getEventById(id: Long): Flow<EventEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertEvent(event: EventEntity)

    @Update
    suspend fun updateEvent(event: EventEntity)

    @Delete
    suspend fun deleteEvent(event: EventEntity)


    // 🔍 Search by name or description
    @Query("SELECT * FROM events WHERE name LIKE '%' || :query || '%' OR description LIKE '%' || :query || '%'")
    fun searchEvents(query: String): Flow<List<EventEntity>>


    // 🟣 Filter: Free events (tag contains “Free”)
    @Query("SELECT * FROM events WHERE tags LIKE '%Free%'")
    fun filterFreeEvents(): Flow<List<EventEntity>>


    // 🟡 Filter: Clubs category
    @Query("SELECT * FROM events WHERE category = 'clubs'")
    fun filterClubs(): Flow<List<EventEntity>>


    // 🔵 Filter: Academic category
    @Query("SELECT * FROM events WHERE category = 'academic'")
    fun filterAcademic(): Flow<List<EventEntity>>


    // 📅 Filter: Today (YYYY-MM-DD)
    @Query("SELECT * FROM events WHERE date = :today")
    fun filterToday(today: String): Flow<List<EventEntity>>


    // 📆 Filter: This Week (between dates)
    @Query("SELECT * FROM events WHERE date BETWEEN :start AND :end")
    fun filterThisWeek(start: String, end: String): Flow<List<EventEntity>>
}

