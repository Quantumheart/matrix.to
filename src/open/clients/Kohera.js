/*
Copyright 2020 The Matrix.org Foundation C.I.C.
Copyright 2024 Quantumheart

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { Maturity, Platform, LinkKind, FlathubLink, WebsiteLink } from "../types.js";

/**
 * Information on how to deep link to a given matrix client.
 */
export class Kohera {
    get id() { return "io.github.quantumheart.kohera"; }
    get name() { return "Kohera"; }
    get icon() { return "images/client-icons/kohera.svg"; }
    get author() { return "Quantumheart"; }
    get homepage() { return "https://github.com/Quantumheart/Kohera"; }
    get platforms() {
        return [
            Platform.Android, Platform.iOS,
            Platform.Windows, Platform.macOS, Platform.Linux,
            Platform.DesktopWeb,
        ];
    }
    get description() { return "A retro-pixel Matrix chat client — coherent threads for encrypted messaging, voice/video calls, and spaces."; }
    getMaturity(platform) {
        switch (platform) {
            case Platform.Linux: return Maturity.Beta;
            case Platform.Windows: return Maturity.Beta;
            case Platform.DesktopWeb: return Maturity.Beta;
            case Platform.Android: return Maturity.Beta;
            case Platform.macOS: return Maturity.Beta;
            case Platform.iOS: return Maturity.Alpha;
        }
    }

    getInstallLinks(platform) {
        switch (platform) {
            case Platform.Linux: return [
                new FlathubLink("io.github.quantumheart.kohera"),
                new WebsiteLink("https://github.com/Quantumheart/Kohera/releases"),
            ];
            case Platform.DesktopWeb: return [
                new WebsiteLink("https://kohera.quantum-matrix.xyz"),
            ];
            default: return [
                new WebsiteLink("https://github.com/Quantumheart/Kohera/releases"),
            ];
        }
    }

    getLinkInstructions(platform, link) {
        if (link.kind === LinkKind.User) {
            switch (platform) {
                case Platform.DesktopWeb:
                    return "Open the web app at https://kohera.quantum-matrix.xyz and log in. " +
                           "Tap the compose button and paste the username to start a direct message.";
                default:
                    return "Open the app and log in. Tap the compose button and paste the username " +
                           "to start a direct message.";
            }
        }
        if (link.kind === LinkKind.Room) {
            switch (platform) {
                case Platform.DesktopWeb:
                    return "Open the web app at https://kohera.quantum-matrix.xyz and log in. " +
                           "Use 'Join room' and paste the identifier.";
                default:
                    return "Open the app and log in. Use 'Join room' and paste the identifier.";
            }
        }
    }

    getCopyString(platform, link) {
        if (link.kind === LinkKind.User || link.kind === LinkKind.Room) {
            return link.identifier;
        }
    }

    getDeepLink(platform, link) {
        // Desktop platforms use the standard matrix: URI scheme.
        // The app registers as a handler via:
        //   - Linux:  MimeType=x-scheme-handler/matrix in the .desktop file
        //   - Windows: protocol handler in the registry (Inno Setup)
        //   - macOS:  CFBundleURLTypes in Info.plist
        if (platform === Platform.Linux || platform === Platform.Windows || platform === Platform.macOS) {
            let identifier = encodeURIComponent(link.identifier.substring(1));
            let isRoomid = link.identifier.substring(0, 1) === '!';
            let fragmentPath;
            switch (link.kind) {
                case LinkKind.User:
                    fragmentPath = `u/${identifier}?action=chat`;
                    break;
                case LinkKind.Room:
                case LinkKind.Event:
                    if (isRoomid)
                        fragmentPath = `roomid/${identifier}`;
                    else
                        fragmentPath = `r/${identifier}`;

                    if (link.kind === LinkKind.Event)
                        fragmentPath += `/e/${encodeURIComponent(link.eventId.substring(1))}`;
                    fragmentPath += '?action=join';
                    fragmentPath += link.servers.map(server => `&via=${encodeURIComponent(server)}`).join('');
                    break;
                case LinkKind.Group:
                    return;
            }
            return `matrix:${fragmentPath}`;
        }
        // iOS and Android use a custom app-specific URI scheme to avoid
        // conflicts with other Matrix clients on mobile.
        if (platform === Platform.iOS || platform === Platform.Android) {
            return `io.github.quantumheart.kohera://chat/${encodeURIComponent(link.identifier)}`;
        }
    }

    canInterceptMatrixToLinks(platform) {
        return platform === Platform.Android;
    }

    getPreferredWebInstance(link) {}
}