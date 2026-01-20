import { NextResponse } from "next/server"

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ message }, { status: 401 })
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ message }, { status: 403 })
}
