import { Canvas, createCanvas, loadImage, registerFont } from 'canvas'
import { NextApiRequest, NextApiResponse } from 'next'
import path from 'path'

interface SeparatedText {
    line: string
    remaining: string
}

const createTextLine = (canvas: Canvas, text: string): SeparatedText => {
    const context = canvas.getContext('2d')
    const MAX_WIDTH = 1000 as const

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

const ogp = async (
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> => {
    const WIDTH = 1200 as const
    const HEIGHT = 675 as const
    const DX = 0 as const
    const DY = 0 as const

    const { dynamic } = req.query

    const canvas = createCanvas(WIDTH, HEIGHT)
    const ctx = canvas.getContext('2d')

    // Background color
    ctx.fillStyle = '#f2f2f2'
    ctx.fillRect(DX, DY, WIDTH, HEIGHT)

    // Github Icon
    const backgroundImage = await loadImage('https://github.com/yt-ymmt.png')
    ctx.drawImage(backgroundImage, DX, DY, WIDTH, HEIGHT)

    // Text
    registerFont(path.resolve('./src/fonts/NotoSansJP-Bold.otf'), {
        family: 'NotoSansJP',
    })
    ctx.font = '64px NotoSansJP'
    ctx.fillStyle = '#23221f'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'

    const title = String(dynamic)

    const lines = createTextLines(canvas, title)
    lines.forEach((line, index) => {
        const y = 64 + 72 * (index - (lines.length - 1) / 2)
        ctx.fillText(line, 64, y)
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
