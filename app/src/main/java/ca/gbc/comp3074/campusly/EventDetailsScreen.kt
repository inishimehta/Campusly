// EventDetailsScreen.kt
package ca.gbc.comp3074.campusly

import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import kotlinx.coroutines.launch

private val EventPurple = Color(0xFF8E24AA)

@Composable
fun EventDetailsScreen(
    eventId: Long,
    viewModel: EventViewModel,
    onBack: () -> Unit,
    onEditClick: (Long) -> Unit = {}
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    // Load event from Room
    val event = viewModel.getEventById(eventId).collectAsState(initial = null).value

    if (event == null) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Text("Event not found", style = MaterialTheme.typography.bodyLarge)
        }
        return
    }

    Scaffold(
        bottomBar = {
            // Sticky bottom bar with RSVP + Edit
            Surface(
                tonalElevation = 4.dp,
                shadowElevation = 8.dp
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedButton(
                        onClick = {
                            scope.launch { viewModel.toggleRsvp(event) }
                        },
                        modifier = Modifier.weight(1f)
                    ) {
                        Text(if (event.rsvp) "Going ✅" else "RSVP to Event")
                    }

                    Button(
                        onClick = { onEditClick(event.id) },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(containerColor = EventPurple)
                    ) {
                        Icon(Icons.Default.Edit, contentDescription = "Edit")
                        Spacer(Modifier.width(6.dp))
                        Text("Edit")
                    }
                }
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFFF2F4F7))
                .padding(padding)
        ) {
            // Header image with gradient & overlay buttons
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(240.dp)
            ) {
                AsyncImage(
                    model = event.localImageUri ?: event.imageUrl,
                    contentDescription = event.name,
                    modifier = Modifier.fillMaxSize()
                )

                // Gradient overlay
                Box(
                    modifier = Modifier
                        .matchParentSize()
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(Color.Transparent, Color(0xCC000000))
                            )
                        )
                )

                // Back button
                IconButton(
                    onClick = onBack,
                    modifier = Modifier
                        .padding(12.dp)
                        .align(Alignment.TopStart)
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(Color.White.copy(alpha = 0.9f))
                ) {
                    Icon(
                        Icons.Default.ArrowBack,
                        contentDescription = "Back",
                        tint = Color(0xFF111827)
                    )
                }

                // Share button
                IconButton(
                    onClick = {
                        shareEventGeneric(context, event)
                    },
                    modifier = Modifier
                        .padding(12.dp)
                        .align(Alignment.TopEnd)
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(Color.White.copy(alpha = 0.9f))
                ) {
                    Icon(
                        Icons.Default.Share,
                        contentDescription = "Share",
                        tint = Color(0xFF111827)
                    )
                }
            }

            // Content
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Title + tags
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        text = event.name,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFF111827)
                    )

                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.wrapContentWidth()
                    ) {
                        event.tags.forEach { tag ->
                            Surface(
                                color = Color(0xFFE3F2FD),
                                shape = RoundedCornerShape(50)
                            ) {
                                Text(
                                    text = tag,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                                    style = MaterialTheme.typography.labelSmall,
                                    color = EventPurple
                                )
                            }
                        }
                    }
                }

                // Info card (date, location, category, attendees)
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        InfoRow(
                            icon = Icons.Default.CalendarMonth,
                            title = "Date & Time",
                            line1 = event.date,
                            line2 = event.time
                        )
                        InfoRow(
                            icon = Icons.Default.LocationOn,
                            title = "Location",
                            line1 = event.location,
                            line2 = null
                        )
                        InfoRow(
                            icon = Icons.Default.Label,
                            title = "Category",
                            line1 = event.category.replaceFirstChar { it.uppercaseChar() },
                            line2 = null
                        )
                        InfoRow(
                            icon = Icons.Default.Group,
                            title = "Attendees",
                            line1 = "${event.attendees} people attending",
                            line2 = null
                        )
                    }
                }

                // About this event
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        text = "About this event",
                        style = MaterialTheme.typography.titleMedium,
                        color = Color(0xFF111827)
                    )
                    Card(
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White)
                    ) {
                        Text(
                            text = event.description,
                            modifier = Modifier.padding(16.dp),
                            style = MaterialTheme.typography.bodyMedium,
                            color = Color(0xFF4B5563)
                        )
                    }
                }

                // Actions: Directions + Share options + Delete
                Card(
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Text(
                            text = "Actions",
                            style = MaterialTheme.typography.titleMedium,
                            color = Color(0xFF111827)
                        )

                        Button(
                            onClick = {
                                openMapsForLocation(context, event.location)
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = EventPurple)
                        ) {
                            Icon(Icons.Default.Directions, contentDescription = "Directions")
                            Spacer(Modifier.width(6.dp))
                            Text("Get Directions")
                        }

                        Row(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            OutlinedButton(
                                onClick = { shareToPackage(context, event, "com.facebook.katana") },
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("Share to Facebook")
                            }
                            OutlinedButton(
                                onClick = { shareToPackage(context, event, "com.twitter.android") },
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("Share to Twitter")
                            }
                        }

                        OutlinedButton(
                            onClick = {
                                scope.launch {
                                    viewModel.deleteEvent(event)
                                    onBack()
                                }
                            },
                            colors = ButtonDefaults.outlinedButtonColors(
                                contentColor = MaterialTheme.colorScheme.error
                            )
                        ) {
                            Icon(Icons.Default.Delete, contentDescription = "Delete")
                            Spacer(Modifier.width(4.dp))
                            Text("Delete Event")
                        }
                    }
                }

                Spacer(Modifier.height(80.dp)) // for bottom bar space
            }
        }
    }
}

@Composable
private fun InfoRow(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    line1: String,
    line2: String?
) {
    Row(
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.Top
    ) {
        Icon(
            icon,
            contentDescription = title,
            tint = Color(0xFF9CA3AF),
            modifier = Modifier.size(20.dp)
        )
        Column {
            Text(
                text = title,
                style = MaterialTheme.typography.labelSmall,
                color = Color(0xFF6B7280)
            )
            Text(
                text = line1,
                style = MaterialTheme.typography.bodyMedium,
                color = Color(0xFF111827)
            )
            if (line2 != null) {
                Text(
                    text = line2,
                    style = MaterialTheme.typography.bodySmall,
                    color = Color(0xFF6B7280)
                )
            }
        }
    }
}

// --- Helpers: sharing & maps ---

private fun shareEventGeneric(context: android.content.Context, event: EventEntity) {
    val text = buildString {
        append("Check out this event: ${event.name}\n")
        append("${event.date} at ${event.time}\n")
        append("Location: ${event.location}\n\n")
        append(event.description)
    }

    val shareIntent = Intent(Intent.ACTION_SEND).apply {
        type = "text/plain"
        putExtra(Intent.EXTRA_SUBJECT, event.name)
        putExtra(Intent.EXTRA_TEXT, text)
    }

    context.startActivity(Intent.createChooser(shareIntent, "Share event via"))
}

private fun shareToPackage(
    context: android.content.Context,
    event: EventEntity,
    packageName: String
) {
    val text = "Check out this event: ${event.name} at ${event.location} on ${event.date} ${event.time}"

    val intent = Intent(Intent.ACTION_SEND).apply {
        type = "text/plain"
        putExtra(Intent.EXTRA_TEXT, text)
        setPackage(packageName)
    }

    try {
        context.startActivity(intent)
    } catch (e: ActivityNotFoundException) {
        // Fallback to generic share if app isn't installed
        shareEventGeneric(context, event)
    }
}

private fun openMapsForLocation(context: android.content.Context, location: String) {
    val uri = Uri.parse("geo:0,0?q=${Uri.encode(location)}")
    val intent = Intent(Intent.ACTION_VIEW, uri)
    try {
        context.startActivity(intent)
    } catch (e: ActivityNotFoundException) {
        // If no maps app, ignore or show toast in a real app
    }
}

@Preview(showBackground = true)
@Composable
private fun EventDetailsPreview() {
    MaterialTheme {
        // Preview placeholder: we can't load real ViewModel here,
        // so we just show a "not found" state by passing invalid ID.
        // In real previews you might use a fake event.
        Text("EventDetailsScreen preview placeholder")
    }
}
