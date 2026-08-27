package com.lamadorportillo.reuniones;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {

    private static final String APP_URL = "https://lamadorportillo-sudo.github.io/control-de-proyectos/reuniones/?apk=1";
    private static final String TRUSTED_HOST = "lamadorportillo-sudo.github.io";
    private static final int REQ_MIC = 1001;
    private static final int REQ_FILE = 1002;

    private WebView webView;
    private PermissionRequest pendingWebPermission;
    private ValueCallback<Uri[]> fileCallback;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getWindow().setStatusBarColor(Color.rgb(7, 16, 31));
        getWindow().setNavigationBarColor(Color.rgb(7, 16, 31));

        webView = new WebView(this);
        setContentView(webView);

        configureWebView();
        webView.loadUrl(APP_URL);
    }

    private void configureWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setUserAgentString(settings.getUserAgentString() + " AsistenteReunionesAPK/1.1");

        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, false);
        WebView.setWebContentsDebuggingEnabled(false);

        webView.addJavascriptInterface(new AndroidRecorderBridge(), "AndroidRecorder");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (isTrusted(uri)) {
                    return false;
                }

                Intent external = new Intent(Intent.ACTION_VIEW, uri);
                try {
                    startActivity(external);
                } catch (Exception ignored) {
                }
                return true;
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(() -> handleWebPermissionRequest(request));
            }

            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> callback, FileChooserParams fileChooserParams) {
                if (fileCallback != null) {
                    fileCallback.onReceiveValue(null);
                }
                fileCallback = callback;

                Intent intent;
                try {
                    intent = fileChooserParams.createIntent();
                } catch (Exception e) {
                    intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                    intent.addCategory(Intent.CATEGORY_OPENABLE);
                    intent.setType("*/*");
                }

                try {
                    startActivityForResult(Intent.createChooser(intent, "Seleccionar archivo"), REQ_FILE);
                    return true;
                } catch (Exception e) {
                    fileCallback = null;
                    return false;
                }
            }
        });
    }

    private final class AndroidRecorderBridge {
        @JavascriptInterface
        public void startKeepAlive() {
            runOnUiThread(() -> {
                Intent service = new Intent(MainActivity.this, RecordingKeepAliveService.class);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    startForegroundService(service);
                } else {
                    startService(service);
                }
            });
        }

        @JavascriptInterface
        public void stopKeepAlive() {
            runOnUiThread(() -> stopService(
                    new Intent(MainActivity.this, RecordingKeepAliveService.class)
            ));
        }

        @JavascriptInterface
        public boolean isKeepAliveRunning() {
            return RecordingKeepAliveService.isRunning();
        }
    }

    private boolean isTrusted(Uri uri) {
        return uri != null
                && "https".equalsIgnoreCase(uri.getScheme())
                && TRUSTED_HOST.equalsIgnoreCase(uri.getHost());
    }

    private void handleWebPermissionRequest(PermissionRequest request) {
        Uri origin = request.getOrigin();
        if (!isTrusted(origin)) {
            request.deny();
            return;
        }

        boolean asksForAudio = false;
        for (String resource : request.getResources()) {
            if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resource)) {
                asksForAudio = true;
                break;
            }
        }

        if (!asksForAudio) {
            request.deny();
            return;
        }

        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
            request.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
        } else {
            pendingWebPermission = request;
            requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, REQ_MIC);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQ_MIC && pendingWebPermission != null) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                pendingWebPermission.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
            } else {
                pendingWebPermission.deny();
            }
            pendingWebPermission = null;
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQ_FILE && fileCallback != null) {
            Uri[] result = WebChromeClient.FileChooserParams.parseResult(resultCode, data);
            fileCallback.onReceiveValue(result);
            fileCallback = null;
        }
    }

    @Override
    public void onBackPressed() {
        if (RecordingKeepAliveService.isRunning()) {
            moveTaskToBack(true);
            return;
        }
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
            webView.evaluateJavascript(
                    "window.RM && window.RM.refreshRecordingUi && window.RM.refreshRecordingUi()",
                    null
            );
        }
    }

    @Override
    protected void onPause() {
        // No se pausa el WebView aquí: una grabación activa debe continuar al
        // minimizar la app o bloquear la pantalla. El servicio en primer plano
        // mantiene el proceso y la CPU activos hasta que el usuario pulse Finalizar.
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        if (webView != null && !RecordingKeepAliveService.isRunning()) {
            webView.stopLoading();
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
