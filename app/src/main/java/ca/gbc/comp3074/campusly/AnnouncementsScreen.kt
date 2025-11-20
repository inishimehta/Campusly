package ca.gbc.comp3074.campusly

import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.OpenInNew
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.AnnotatedString
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
    var linkError by remember { mutableStateOf("") }

    fun openNewDialog() {
        editingAnnouncement = null
        titleText = ""
        messageText = ""
        linkText = ""
        linkError = ""
        showDialog = true
    }

    fun openEditDialog(a: AnnouncementEntity) {
        editingAnnouncement = a
        titleText = a.title
        messageText = a.message
        linkText = a.link
        linkError = ""
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
                Icon(Icons.Default.Add, contentDescription = "Add Announcement")
            }
        }
    ) { padding ->

        if (announcements.isEmpty()) {
            Box(
                modifier = Modifier
                    .padding(padding)
                    .fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Text("No announcements yet. Tap + to add one.")
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .padding(padding)
                    .fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(14.dp)
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

    if (showDialog) {
        AlertDialog(
            onDismissRequest = { showDialog = false },
            title = { Text(if (editingAnnouncement == null) "New Announcement" else "Edit Announcement") },
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
                        minLines = 3,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(Modifier.height(8.dp))

                    OutlinedTextField(
                        value = linkText,
                        onValueChange = {
                            linkText = it
                            linkError = ""
                        },
                        label = { Text("Link (URL)") },
                        isError = linkError.isNotEmpty(),
                        modifier = Modifier.fillMaxWidth()
                    )

                    if (linkError.isNotEmpty()) {
                        Text(linkError, color = Color.Red, fontSize = 12.sp)
                    }
                }
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        val valid = linkText.startsWith("http://") || linkText.startsWith("https://")
                        if (!valid) {
                            linkError = "Link must start with http:// or https://"
                            return@TextButton
                        }

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
    val clipboard = LocalClipboardManager.current

    Card(
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 6.dp),
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
    ) {
        Column(Modifier.padding(18.dp)) {

            Text(
                announcement.title,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF2160B0)
            )

            Spacer(Modifier.height(6.dp))

            Text(
                announcement.message,
                fontSize = 14.sp,
                color = Color.DarkGray
            )

            Spacer(Modifier.height(10.dp))

            // CLICKABLE LINK
            if (announcement.link.isNotEmpty()) {
                Text(
                    text = announcement.link,
                    color = Color(0xFF1A73E8),
                    fontSize = 14.sp,
                    modifier = Modifier.clickable {
                        try {
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(announcement.link))
                            context.startActivity(intent)
                        } catch (e: Exception) {
                            Toast.makeText(context, "Invalid link", Toast.LENGTH_SHORT).show()
                        }
                    }
                )
            }

            Spacer(Modifier.height(10.dp))

            Row(verticalAlignment = Alignment.CenterVertically) {

                // OPEN LINK
                IconButton(onClick = {
                    try {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(announcement.link))
                        context.startActivity(intent)
                    } catch (e: Exception) {
                        Toast.makeText(context, "Invalid link", Toast.LENGTH_SHORT).show()
                    }
                }) {
                    Icon(Icons.Default.OpenInNew, contentDescription = "Open Link", tint = Color(0xFF1976D2))
                }

                // COPY LINK
                IconButton(onClick = {
                    clipboard.setText(AnnotatedString(announcement.link))
                    Toast.makeText(context, "Link copied!", Toast.LENGTH_SHORT).show()
                }) {
                    Icon(Icons.Default.ContentCopy, contentDescription = "Copy Link", tint = Color.DarkGray)
                }

                // FACEBOOK SHARE
                IconButton(onClick = {
                    val encoded = Uri.encode(announcement.link)
                    val fbUrl = "https://www.facebook.com/sharer/sharer.php?u=$encoded"
                    context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(fbUrl)))
                }) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_facebook),
                        contentDescription = "Share on Facebook",
                        tint = Color.Unspecified
                    )
                }

                // TWITTER SHARE
                IconButton(onClick = {
                    val text = Uri.encode(announcement.title)
                    val url = Uri.encode(announcement.link)
                    val tweet = "https://twitter.com/intent/tweet?text=$text&url=$url"
                    context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(tweet)))
                }) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_twitter),
                        contentDescription = "Share on Twitter",
                        tint = Color.Unspecified
                    )
                }
            }

            Spacer(Modifier.height(10.dp))

            // USER-ADDED ONLY
            if (!announcement.isSeeded) {
                Row {
                    IconButton(onClick = onEdit) {
                        Icon(Icons.Default.Edit, contentDescription = "Edit Announcement")
                    }
                    IconButton(onClick = onDelete) {
                        Icon(Icons.Default.Delete, contentDescription = "DeleteAnnouncement", tint = Color(0xFFD32F2F))
                    }
                }
            }
        }
    }
}
