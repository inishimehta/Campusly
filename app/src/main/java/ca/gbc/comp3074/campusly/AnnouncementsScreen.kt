package ca.gbc.comp3074.campusly

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AnnouncementsScreen(
    viewModel: AnnouncementViewModel,
    onBack: () -> Unit
) {
    val announcements by viewModel.announcements.collectAsState()

    var showDialog by remember { mutableStateOf(false) }
    var editingAnnouncement by remember { mutableStateOf<AnnouncementEntity?>(null) }
    var titleText by remember { mutableStateOf("") }
    var messageText by remember { mutableStateOf("") }
    var linkText by remember { mutableStateOf("") }

    // OPEN NEW ANNOUNCEMENT DIALOG
    fun openNewDialog() {
        editingAnnouncement = null
        titleText = ""
        messageText = ""
        linkText = ""
        showDialog = true
    }

    // OPEN EDIT DIALOG
    fun openEditDialog(a: AnnouncementEntity) {
        editingAnnouncement = a
        titleText = a.title
        messageText = a.message
        linkText = a.link
        showDialog = true
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Campus Announcements") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = { openNewDialog() }) {
                Icon(Icons.Default.Add, contentDescription = "Add announcement")
            }
        },
        containerColor = Color(0xFFF6F6F6)
    ) { padding ->

        if (announcements.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = Alignment.Center
            ) {
                Text("No announcements yet. Tap + to add one.")
            }
        } else {
            LazyColumn(
                contentPadding = padding,
                verticalArrangement = Arrangement.spacedBy(14.dp),
                modifier = Modifier
                    .fillMaxSize()
                    .padding(20.dp)
            ) {
                items(announcements) { announcement ->
                    AnnouncementCard(
                        announcement = announcement,
                        onEdit = { if (!announcement.isSeeded) openEditDialog(announcement) },
                        onDelete = { if (!announcement.isSeeded) viewModel.deleteAnnouncement(announcement) }
                    )
                }
            }
        }
    }

    // DIALOG — Add / Edit Announcement
    if (showDialog) {
        AlertDialog(
            onDismissRequest = { showDialog = false },
            title = {
                Text(if (editingAnnouncement == null) "New Announcement" else "Edit Announcement")
            },
            text = {
                Column {
                    OutlinedTextField(
                        value = titleText,
                        onValueChange = { titleText = it },
                        label = { Text("Title") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(Modifier.height(8.dp))
                    OutlinedTextField(
                        value = messageText,
                        onValueChange = { messageText = it },
                        label = { Text("Details") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 3
                    )
                    Spacer(Modifier.height(8.dp))
                    OutlinedTextField(
                        value = linkText,
                        onValueChange = { linkText = it },
                        label = { Text("Link (URL)") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        if (editingAnnouncement == null) {
                            viewModel.addAnnouncement(titleText, messageText, linkText)
                        } else {
                            viewModel.updateAnnouncement(
                                editingAnnouncement!!,
                                titleText,
                                messageText,
                                linkText
                            )
                        }
                        showDialog = false
                    }
                ) {
                    Text("Save")
                }
            },
            dismissButton = {
                if (editingAnnouncement != null) {
                    TextButton(
                        onClick = {
                            viewModel.deleteAnnouncement(editingAnnouncement!!)
                            showDialog = false
                        }
                    ) {
                        Icon(Icons.Default.Delete, contentDescription = null)
                        Spacer(Modifier.width(4.dp))
                        Text("Delete")
                    }
                } else {
                    TextButton(onClick = { showDialog = false }) {
                        Text("Cancel")
                    }
                }
            }
        )
    }
}

@Composable
fun AnnouncementCard(
    announcement: AnnouncementEntity,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    val context = LocalContext.current

    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp)
    ) {
        Column(Modifier.padding(18.dp)) {

            // Title
            Text(
                text = announcement.title,
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp,
                color = Color(0xFF2160B0)
            )

            Spacer(Modifier.height(6.dp))

            // Message
            Text(
                text = announcement.message,
                fontSize = 14.sp,
                color = Color.DarkGray
            )

            Spacer(Modifier.height(10.dp))

            // Link (clickable)
            if (announcement.link.isNotBlank()) {
                Text(
                    text = announcement.link,
                    color = Color(0xFF1A73E8),
                    fontSize = 14.sp,
                    modifier = Modifier.clickable {
                        try {
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(announcement.link))
                            context.startActivity(intent)
                        } catch (e: Exception) {
                            e.printStackTrace()
                        }
                    }
                )
            }

            Spacer(Modifier.height(10.dp))

            // Edit/Delete buttons only for USER-added announcements
            if (!announcement.isSeeded) {
                Row {
                    IconButton(onClick = onEdit) {
                        Icon(Icons.Default.Edit, contentDescription = "Edit", tint = Color(0xFF1976D2))
                    }
                    IconButton(onClick = onDelete) {
                        Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color(0xFFD32F2F))
                    }
                }
            }
        }
    }
}
