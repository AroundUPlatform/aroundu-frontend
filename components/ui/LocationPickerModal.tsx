"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "./Button";
import { Input } from "./Input";
import { cn } from "../../lib/cn";

export interface LocationResult {
    latitude: number;
    longitude: number;
    fullAddress: string;
    city: string;
    area: string;
    postalCode: string;
    country: string;
}

interface LocationPickerModalProps {
    open: boolean;
    onClose: () => void;
    onSelect: (location: LocationResult) => void;
    initialLat?: number;
    initialLng?: number;
}

const DEFAULT_LAT = 25.2048;
const DEFAULT_LNG = 55.2708;

export function LocationPickerModal({
    open,
    onClose,
    onSelect,
    initialLat,
    initialLng,
}: LocationPickerModalProps) {
    const [lat, setLat] = useState(initialLat ?? DEFAULT_LAT);
    const [lng, setLng] = useState(initialLng ?? DEFAULT_LNG);
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [area, setArea] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [country, setCountry] = useState("");
    const [detecting, setDetecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    /* ── Detect user location on open ── */
    useEffect(() => {
        if (!open) return;
        if (initialLat != null && initialLng != null) return;
        detectLocation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const detectLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            return;
        }
        setDetecting(true);
        setError(null);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLat(pos.coords.latitude);
                setLng(pos.coords.longitude);
                setDetecting(false);
                reverseGeocode(pos.coords.latitude, pos.coords.longitude);
            },
            () => {
                setDetecting(false);
                setError("Could not detect your location. Please enter it manually.");
            },
            { enableHighAccuracy: true, timeout: 10000 },
        );
    }, []);

    /* ── Reverse geocode via Nominatim (free, no API key) ── */
    const reverseGeocode = async (latitude: number, longitude: number) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
                { headers: { "Accept-Language": "en" } },
            );
            if (!res.ok) return;
            const data = await res.json();
            const addr = data.address ?? {};
            setAddress(data.display_name ?? "");
            setCity(addr.city ?? addr.town ?? addr.village ?? "");
            setArea(addr.suburb ?? addr.neighbourhood ?? addr.county ?? "");
            setPostalCode(addr.postcode ?? "");
            setCountry(addr.country_code?.toUpperCase() ?? "");
        } catch {
            /* silently ignore — user can type manually */
        }
    };

    /* ── Close on backdrop click ── */
    const handleBackdrop = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) onClose();
    };

    /* ── Confirm selection ── */
    const confirm = () => {
        onSelect({
            latitude: lat,
            longitude: lng,
            fullAddress: address,
            city,
            area,
            postalCode,
            country,
        });
        onClose();
    };

    if (!open) return null;

    return (
        <div
            ref={overlayRef}
            onClick={handleBackdrop}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
            <div
                className={cn(
                    "relative mx-4 w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-card",
                    "animate-fade-in",
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                    <h3 className="text-lg font-semibold text-text">Pick Location</h3>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-white/10 hover:text-text"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                {/* Map preview */}
                <div className="relative h-48 w-full bg-surface-strong">
                    {/* OpenStreetMap tile preview */}
                    <img
                        src={`https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=15&size=600x300&markers=${lat},${lng},red-pushpin`}
                        alt="Map preview"
                        className="h-full w-full object-cover"
                    />
                    {/* Coordinates overlay */}
                    <div className="absolute bottom-2 left-2 rounded-lg bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm">
                        {lat.toFixed(5)}, {lng.toFixed(5)}
                    </div>
                </div>

                {/* Body */}
                <div className="space-y-4 p-5">
                    {error && (
                        <div className="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
                            {error}
                        </div>
                    )}

                    <div className="grid gap-3 sm:grid-cols-2">
                        <Input
                            label="Latitude"
                            type="number"
                            step="any"
                            value={String(lat)}
                            onChange={(e) => setLat(Number(e.target.value))}
                        />
                        <Input
                            label="Longitude"
                            type="number"
                            step="any"
                            value={String(lng)}
                            onChange={(e) => setLng(Number(e.target.value))}
                        />
                    </div>

                    <Input
                        label="Full address"
                        placeholder="123 Market St, Dubai…"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />

                    <div className="grid gap-3 sm:grid-cols-2">
                        <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} />
                        <Input label="Area" value={area} onChange={(e) => setArea(e.target.value)} />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <Input label="Postal code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                        <Input label="Country code" placeholder="US" value={country} onChange={(e) => setCountry(e.target.value)} />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-border px-5 py-4">
                    <Button variant="ghost" onClick={detectLocation} loading={detecting}>
                        📍 Detect my location
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button onClick={confirm}>Confirm Location</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
