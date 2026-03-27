import { useEffect, useRef, useMemo } from "react";
import { VideoTexture, DoubleSide } from "three";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uThresholdBlack;
  uniform float uSmoothingBlack;
  uniform float uThresholdGreen;
  uniform float uSmoothingGreen;
  varying vec2 vUv;

  float getBrightness(vec3 color) {
    return (color.r + color.g + color.b) / 3.0;
  }

  float getSaturation(vec3 color) {
    float maxC = max(max(color.r, color.g), color.b);
    float minC = min(min(color.r, color.g), color.b);
    return maxC - minC;
  }

  void main() {
    vec4 color = texture2D(uTexture, vUv);

    // --- Xử lý nền đen ---
    float brightness = getBrightness(color.rgb);
    float saturation = getSaturation(color.rgb);
    float mask = brightness * 0.7 + saturation * 0.3;
    float alphaBlack = smoothstep(
      uThresholdBlack - uSmoothingBlack,
      uThresholdBlack + uSmoothingBlack,
      mask
    );

    // --- Xử lý nền xanh ---
    float greenness = color.g - max(color.r, color.b);
    float alphaGreen = 1.0 - smoothstep(
      uThresholdGreen - uSmoothingGreen,
      uThresholdGreen + uSmoothingGreen,
      greenness
    );
    alphaGreen = pow(alphaGreen, 1.5); // làm gọn viền

    // Alpha tổng (nếu nền đen HẶC nền xanh thì đều trong suốt)
    float alpha = min(alphaBlack, alphaGreen);

    if (alpha < 0.02) discard;

    // Khử viền xanh (chỉ áp dụng nhẹ vùng viền)
    vec3 finalColor = color.rgb;
    finalColor.g = min(finalColor.g, max(finalColor.r, finalColor.b));

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export const BlackScreenVideo = ({ videoSrc }) => {
  const meshRef = useRef();
  const videoRef = useRef();
  const textureRef = useRef();

  const uniforms = useMemo(
    () => ({
      uTexture: { value: null },
      uThresholdBlack: { value: 0.09 },
      uSmoothingBlack: { value: 0.08 },
      uThresholdGreen: { value: 0.4 },
      uSmoothingGreen: { value: 0.06 },
    }),
    [],
  );

  useEffect(() => {
    if (!videoSrc) return;

    // tạo video
    const video = document.createElement("video");
    video.src = videoSrc;
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = false; // QUAN TRỌNG
    video.playsInline = true;
    video.preload = "auto";

    const texture = new VideoTexture(video);

    videoRef.current = video;
    textureRef.current = texture;

    // ẩn mesh trước khi load xong
    if (meshRef.current) {
      meshRef.current.visible = false;
    }

    // khi video có frame đầu
    const handleLoaded = () => {
      video.play().catch(() => {});

      uniforms.uTexture.value = texture;

      if (meshRef.current) {
        meshRef.current.visible = true;
        meshRef.current.material.needsUpdate = true;
      }
    };

    video.addEventListener("loadeddata", handleLoaded);

    return () => {
      video.pause();
      video.removeAttribute("src");
      video.load();
      video.removeEventListener("loadeddata", handleLoaded);

      texture.dispose();
    };
  }, [videoSrc, uniforms]);

  return (
    <mesh
      ref={meshRef}
      position={[-0.1, -2, -5]}
      scale={[5, 12, 1]}
    >
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        side={DoubleSide}
        uniforms={uniforms}
      />
    </mesh>
  );
};
