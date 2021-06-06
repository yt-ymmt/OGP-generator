import { Canvas, createCanvas, loadImage, registerFont } from 'canvas'
import { NextApiRequest, NextApiResponse } from 'next'
import path from 'path'

/*
 *
 */
type SeparatedText = {
    line: string
    remaining: string
}

const createTextLine = (canvas: Canvas, text: string): SeparatedText => {
    const context = canvas.getContext('2d')
    const MAX_WIDTH = 960 as const

    for (let i = 0; i < text.length; i += 1) {
        const line = text.substring(0, i + 1)

        if (context.measureText(line).width > MAX_WIDTH) {
            return {
                line,
                remaining: text.substring(i + 1),
            }
        }
    }

    return {
        line: text,
        remaining: '',
    }
}

const createTextLines = (canvas: Canvas, text: string): string[] => {
    const lines: string[] = []
    let currentText = text

    while (currentText !== '') {
        const separatedText = createTextLine(canvas, currentText)
        lines.push(separatedText.line)
        currentText = separatedText.remaining
    }
    return lines
}

/*
 *
 */
const createGithubICon: () => Promise<Canvas> = async () => {
    const THUMBNAIL_WIDTH = 150 as const
    const THUMBNAIL_HEIGHT = 150 as const

    const canvas = createCanvas(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT)
    const ctx = canvas.getContext('2d')

    ctx.beginPath()
    ctx.arc(
        THUMBNAIL_WIDTH / 2,
        THUMBNAIL_HEIGHT / 2,
        THUMBNAIL_WIDTH / 2,
        (0 * Math.PI) / THUMBNAIL_WIDTH,
        (360 * Math.PI) / THUMBNAIL_WIDTH
    )
    // ctx.stroke()
    ctx.clip()

    const backgroundImage = await loadImage('https://github.com/yt-ymmt.png')
    ctx.drawImage(backgroundImage, 0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT)
    return canvas
}

/*
 *
 */
const ogp = async (
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> => {
    const { dynamic } = req.query

    const WIDTH = 1200 as const
    const HEIGHT = 675 as const
    const DX = 0 as const
    const DY = 0 as const
    const THUMBNAIL_WIDTH = 150 as const
    const THUMBNAIL_HEIGHT = 150 as const
    const BASE_SPACING = 72 as const

    const canvas = createCanvas(WIDTH, HEIGHT)
    const ctx = canvas.getContext('2d')
    registerFont(path.resolve('./src/fonts/NotoSansJP-Bold.otf'), {
        family: 'NotoSansJP',
    })

    // Background color
    ctx.fillStyle = '#23221f'
    ctx.fillRect(DX, DY, WIDTH, HEIGHT)
    ctx.fillStyle = '#23221f'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'

    // Background Frame
    ctx.lineWidth = 4
    ctx.strokeStyle = `#23221f`
    ctx.fillStyle = '#f2f2f2'
    ctx.moveTo(BASE_SPACING, BASE_SPACING + 0.5)
    ctx.beginPath()
    ctx.arc(
        BASE_SPACING,
        HEIGHT - BASE_SPACING,
        32,
        Math.PI,
        Math.PI * 0.5,
        true
    )
    ctx.arc(
        WIDTH - BASE_SPACING,
        HEIGHT - BASE_SPACING,
        32,
        Math.PI * 0.5,
        0,
        true
    )
    ctx.arc(WIDTH - BASE_SPACING, BASE_SPACING, 32, 0, Math.PI * 1.5, true)
    ctx.arc(BASE_SPACING, BASE_SPACING, 32, Math.PI * 1.5, Math.PI, true)
    ctx.closePath()
    ctx.stroke()
    ctx.fill()

    // Github Icon
    const icon = await createGithubICon()
    ctx.drawImage(
        icon,
        BASE_SPACING,
        HEIGHT - THUMBNAIL_WIDTH - BASE_SPACING,
        THUMBNAIL_WIDTH,
        THUMBNAIL_HEIGHT
    )

    // Github Name
    ctx.fillStyle = '#23221f'
    ctx.font = '48px NotoSansJP'
    ctx.fillText(
        'yt-ymmt',
        THUMBNAIL_WIDTH + BASE_SPACING * 1.5,
        HEIGHT - THUMBNAIL_HEIGHT - BASE_SPACING / 2
    )

    // Text
    ctx.font = '64px NotoSansJP'
    const title = String(dynamic)

    const lines = createTextLines(canvas, title)
    lines.forEach((line, index) => {
        const y = BASE_SPACING + 32 + 88 * (index - (lines.length - 1) / 2)
        ctx.fillText(line, BASE_SPACING, y)
    })

    // To buffer
    const buffer = canvas.toBuffer()

    // Response
    res.writeHead(200, {
        'Content-Type': 'image/webp',
        'Content-Length': buffer.length,
    })
    res.end(buffer, 'binary')
}

export default ogp
