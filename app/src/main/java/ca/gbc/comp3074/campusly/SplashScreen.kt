package ca.gbc.comp3074.campusly

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(onDone: () -> Unit) {
    LaunchedEffect(Unit) {
        delay(1500)
        onDone()
    }

    // App brand colors
    val blueStart = Color(0xFF2152FF)
    val blueEnd = Color(0xFF0B2DCC)
    val dotGrey = Color(0x66FFFFFF)
    val dotWhite = Color(0xFFFFFFFF)
    val accentYellow = Color(0xFFFFC542)
    val accentGreen = Color(0xFF29CC6A)

    // Rounded device-like container
    Surface(
        tonalElevation = 0.dp,
        shadowElevation = 0.dp,
        shape = RoundedCornerShape(28.dp),
        modifier = Modifier
            .fillMaxSize()
            .padding(12.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(blueStart, blueEnd)
                    )
                )
        ) {
            // Subtle decorative soft blob behind the logo
            Canvas(
                modifier = Modifier
                    .align(Alignment.Center)
                    .size(220.dp)
            ) {
                val path = Path().apply {
                    moveTo(size.width * 0.10f, size.height * 0.60f)
                    cubicTo(
                        size.width * 0.15f, size.height * 0.10f,
                        size.width * 0.85f, size.height * 0.10f,
                        size.width * 0.90f, size.height * 0.60f
                    )
                    cubicTo(
                        size.width * 0.85f, size.height * 0.95f,
                        size.width * 0.15f, size.height * 0.95f,
                        size.width * 0.10f, size.height * 0.60f
                    )
                    close()
                }
                drawPath(
                    path = path,
                    brush = Brush.radialGradient(
                        colors = listOf(Color(0x33FFFFFF), Color.Transparent),
                        center = Offset(size.width * 0.5f, size.height * 0.45f),
                        radius = size.minDimension * 0.7f
                    )
                )
            }

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 28.dp, vertical = 36.dp),
                verticalArrangement = Arrangement.SpaceBetween,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Spacer(Modifier.height(8.dp))

                // Center stack: Logo mark + Title + Subtitle
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    CampuslyLogoMark(
                        accentYellow = accentYellow,
                        accentGreen = accentGreen
                    )
                    Spacer(Modifier.height(16.dp))
                    Text(
                        text = "Campusly",
                        color = Color.White,
                        fontSize = 36.sp,
                        fontWeight = FontWeight.ExtraBold,
                        letterSpacing = 0.5.sp
                    )
                    Spacer(Modifier.height(8.dp))
                    Text(
                        text = "Your Student Life\nCompanion",
                        color = Color(0xE6FFFFFF),
                        fontSize = 16.sp,
                        lineHeight = 22.sp,
                        textAlign = TextAlign.Center
                    )
                    Spacer(Modifier.height(24.dp))
                    PagerDots(active = 2, total = 3, activeColor = dotWhite, inactiveColor = dotGrey)
                }

                // Footer group label
                Text(
                    text = "Group 27",
                    color = Color(0xCCFFFFFF),
                    fontSize = 14.sp
                )
            }
        }
    }
}

@Composable
private fun CampuslyLogoMark(
    accentYellow: Color,
    accentGreen: Color,
) {
    Box(
        contentAlignment = Alignment.Center,
        modifier = Modifier
            .size(96.dp)
    ) {
        // Outer rounded square
        Box(
            modifier = Modifier
                .size(86.dp)
                .clip(RoundedCornerShape(20.dp))
                .background(Color(0x22FFFFFF))
        )

        // Inner card
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .size(64.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(Color.White)
        ) {
            Text(
                text = "C",
                color = Color(0xFF2152FF),
                fontSize = 26.sp,
                fontWeight = FontWeight.Bold
            )
        }

        // Accent dots
        Box(
            modifier = Modifier
                .align(Alignment.TopEnd)
                .offset(x = 4.dp, y = (-4).dp)
                .size(14.dp)
                .clip(CircleShape)
                .background(accentYellow)
        )
        Box(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .offset(x = (-6).dp, y = 6.dp)
                .size(12.dp)
                .clip(CircleShape)
                .background(accentGreen)
        )
    }
}

@Composable
private fun PagerDots(
    active: Int,
    total: Int,
    activeColor: Color,
    inactiveColor: Color
) {
    Row(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        repeat(total) { index ->
            val color = if (index == active - 1) activeColor else inactiveColor
            Box(
                modifier = Modifier
                    .size(if (index == active - 1) 8.dp else 7.dp)
                    .clip(CircleShape)
                    .background(color)
            )
        }
    }
}

@Preview(showBackground = true, backgroundColor = 0xFF0B2DCC)
@Composable
private fun SplashPreview() {
    MaterialTheme { SplashScreen(onDone = {}) }
}
