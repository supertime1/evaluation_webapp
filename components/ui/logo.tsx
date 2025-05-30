import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Logo({ size = "md", className }: LogoProps) {
  const sizes = {
    sm: { width: 100, height: 28 },
    md: { width: 140, height: 38 },
    lg: { width: 180, height: 50 },
  }

  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <Image 
        src="/logo.svg" 
        alt="LLM Evaluation Dashboard" 
        width={sizes[size].width} 
        height={sizes[size].height}
        priority
      />
    </Link>
  )
}

interface LogomarkProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function Logomark({ className, size = "md" }: LogomarkProps) {
  const sizes = {
    sm: { width: 32, height: 32 },
    md: { width: 48, height: 48 },
    lg: { width: 64, height: 64 },
  }

  return (
    <Image 
      src="/logomark.svg" 
      alt="LLM Eval Logomark" 
      width={sizes[size].width} 
      height={sizes[size].height}
      className={className}
      priority
    />
  )
} 