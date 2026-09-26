import asyncio

from services.cloudflare_service import generate_image


async def main():
    prompt = """
    Professional YouTube thumbnail about System Design.
    Dark modern technology background,
    large readable visual hierarchy,
    glowing server architecture,
    database and API elements,
    high contrast,
    professional developer-focused design.
    """

    print("Generating image with Cloudflare Workers AI...")

    image_bytes = await generate_image(
        prompt=prompt,
        steps=4,
    )

    output_file = "cloudflare_test.jpg"

    with open(output_file, "wb") as file:
        file.write(image_bytes)

    print(f"Success! Image saved to: {output_file}")
    print(f"Image size: {len(image_bytes):,} bytes")


if __name__ == "__main__":
    asyncio.run(main())