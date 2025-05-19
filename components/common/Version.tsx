'use client';

// Import the version from package.json
const packageJson = require('../../../package.json');

interface VersionProps {
    pathname: string; // Accept pathname as a prop
}

export default function Version({ pathname }: VersionProps) {
    const gitSha = process.env.NEXT_PUBLIC_GIT_SHA;
    const shortSha = gitSha ? gitSha.substring(0, 7) : 'development';
    const version = packageJson.version;

    return (
        <div className="px-4 py-2 text-sm text-gray-400 border-t border-gray-100">
            {pathname === '/' ? (
                <div className="flex items-center gap-3">
                    <span>Version</span>
                    <div className="flex items-center gap-1.5">
                        <span>{version}</span>
                        <span className="text-gray-300">/</span>
                        <span className="italic">{shortSha}</span>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-start gap-1.5">
                    <span>Version</span>
                    <div className="flex items-start">
                        <span>{version}</span>
                        <span className="text-gray-300">/</span>
                        <span className="italic">{shortSha}</span>
                    </div>
                </div>
            )}
        </div>
    );
} 
