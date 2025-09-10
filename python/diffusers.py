from typing import Any, List, Dict, Tuple

from .core import assert_unchecked
from .pydantic_types import GeneratorType, TensorType, ImageType
import torch
from torch import FloatTensor
from PIL.Image import Image

# TODO: Check that this correctly gets generated as a union in JSON Schema
# If not, we should just define it as `Image`.
# from diffusers.image_processor import PipelineImageInput
PipelineImageInput = ImageType
from diffusers.pipelines.stable_diffusion.pipeline_stable_diffusion import (
    StableDiffusionPipeline,
)
from diffusers.pipelines.stable_diffusion.pipeline_output import (
    StableDiffusionPipelineOutput,
)
from diffusers.pipelines.stable_diffusion.pipeline_stable_diffusion_img2img import (
    StableDiffusionImg2ImgPipeline,
)
from diffusers.pipelines.stable_diffusion.pipeline_stable_diffusion_inpaint import (
    StableDiffusionInpaintPipeline,
)
from diffusers.pipelines.stable_diffusion_xl.pipeline_stable_diffusion_xl import (
    StableDiffusionXLPipeline,
)
from diffusers.pipelines.stable_diffusion_xl.pipeline_output import (
    StableDiffusionXLPipelineOutput,
)
from diffusers.pipelines.stable_diffusion_xl.pipeline_stable_diffusion_xl_img2img import (
    StableDiffusionXLImg2ImgPipeline,
)
from diffusers.pipelines.stable_diffusion_xl.pipeline_stable_diffusion_xl_inpaint import (
    StableDiffusionXLInpaintPipeline,
)
from diffusers.pipelines.stable_diffusion_3.pipeline_stable_diffusion_3 import (
    StableDiffusion3Pipeline,
)
from diffusers.pipelines.stable_diffusion_3.pipeline_output import (
    StableDiffusion3PipelineOutput,
)
from diffusers.pipelines.stable_diffusion_3.pipeline_stable_diffusion_3_img2img import (
    StableDiffusion3Img2ImgPipeline,
)
from diffusers.pipelines.stable_diffusion_3.pipeline_stable_diffusion_3_inpaint import (
    StableDiffusion3InpaintPipeline,
)
from fastmcp import FastMCP

# https://huggingface.co/docs/diffusers/en/optimization/fp16#torchcompile
inductor: Any = torch._inductor  # pyright: ignore[reportPrivateUsage]
inductor.config.conv_1x1_as_mm = True
inductor.config.coordinate_descent_tuning = True
inductor.config.epilogue_fusion = False
inductor.config.coordinate_descent_check_all_directions = True

mcp = FastMCP("diffusers")
diffusers_mcp = mcp


@mcp.tool
def stable_diffusion_text_to_image(
    model_id_or_path: str,
    prompt: str | List[str],
    height: int | None = None,
    width: int | None = None,
    num_inference_steps: int = 50,
    timesteps: List[int] | None = None,
    sigmas: List[float] | None = None,
    guidance_scale: float = 7.5,
    negative_prompt: str | List[str] | None = None,
    num_images_per_prompt: int | None = 1,
    eta: float = 0,
    generator: GeneratorType | List[GeneratorType] | None = None,
    latents: TensorType | None = None,
    prompt_embeds: TensorType | None = None,
    negative_prompt_embeds: TensorType | None = None,
    ip_adapter_image: PipelineImageInput | None = None,
    ip_adapter_image_embeds: List[TensorType] | None = None,
    output_type: str | None = "pil",
    return_dict: bool = True,
    cross_attention_kwargs: Dict[str, Any] | None = None,
    guidance_rescale: float = 0,
    clip_skip: int | None = None,
) -> ImageType:
    """Generate an image from a prompt using Stable Diffusion"""
    pipeline = StableDiffusionPipeline.from_pretrained(  # pyright: ignore[reportUnknownMemberType]
        model_id_or_path, torch_dtype=torch.float16
    ).to(
        "cuda"
    )
    result = pipeline(
        prompt=prompt,
        height=height,
        width=width,
        num_inference_steps=num_inference_steps,
        timesteps=assert_unchecked(timesteps),
        sigmas=assert_unchecked(sigmas),
        guidance_scale=guidance_scale,
        negative_prompt=negative_prompt,
        num_images_per_prompt=num_images_per_prompt,
        eta=eta,
        generator=generator,
        latents=latents,
        prompt_embeds=prompt_embeds,
        negative_prompt_embeds=negative_prompt_embeds,
        ip_adapter_image=ip_adapter_image,
        ip_adapter_image_embeds=ip_adapter_image_embeds,
        output_type=output_type,
        return_dict=return_dict,
        cross_attention_kwargs=cross_attention_kwargs,
        guidance_rescale=guidance_rescale,
        clip_skip=clip_skip,
    )
    if isinstance(result, StableDiffusionPipelineOutput):
        image = result.images[0]
    else:
        image = result[0]
    if not isinstance(image, Image):
        raise ValueError("Expected image to be a PIL Image")
    return image


@mcp.tool
def stable_diffusion_img2img(
    model_id_or_path: str,
    prompt: str | List[str],
    image: PipelineImageInput,
    strength: float = 0.8,
    num_inference_steps: int | None = 50,
    timesteps: List[int] | None = None,
    sigmas: List[float] | None = None,
    guidance_scale: float | None = 7.5,
    negative_prompt: str | List[str] | None = None,
    num_images_per_prompt: int | None = 1,
    eta: float | None = 0,
    generator: GeneratorType | List[GeneratorType] | None = None,
    prompt_embeds: TensorType | None = None,
    negative_prompt_embeds: TensorType | None = None,
    ip_adapter_image: PipelineImageInput | None = None,
    ip_adapter_image_embeds: List[TensorType] | None = None,
    output_type: str | None = "pil",
    return_dict: bool = True,
    cross_attention_kwargs: Dict[str, Any] | None = None,
    clip_skip: int | None = None,
) -> ImageType:
    """Generate an image from a prompt and input image using Stable Diffusion"""
    pipeline = StableDiffusionImg2ImgPipeline.from_pretrained(  # pyright: ignore[reportUnknownMemberType]
        model_id_or_path, torch_dtype=torch.float16
    ).to(
        "cuda"
    )
    result = pipeline(
        prompt=prompt,
        image=image,
        strength=strength,
        num_inference_steps=num_inference_steps,
        timesteps=assert_unchecked(timesteps),
        sigmas=assert_unchecked(sigmas),
        guidance_scale=guidance_scale,
        negative_prompt=negative_prompt,
        num_images_per_prompt=num_images_per_prompt,
        eta=eta,
        generator=generator,
        prompt_embeds=prompt_embeds,
        negative_prompt_embeds=negative_prompt_embeds,
        ip_adapter_image=ip_adapter_image,
        ip_adapter_image_embeds=ip_adapter_image_embeds,
        output_type=output_type,
        return_dict=return_dict,
        cross_attention_kwargs=cross_attention_kwargs,
        clip_skip=assert_unchecked(clip_skip),
    )
    if isinstance(result, StableDiffusionPipelineOutput):
        output_image = result.images[0]
    else:
        output_image = result[0]
    if not isinstance(output_image, Image):
        raise ValueError("Expected image to be a PIL Image")
    return output_image


@mcp.tool
def stable_diffusion_inpaint(
    model_id_or_path: str,
    prompt: str | List[str],
    image: PipelineImageInput,
    mask_image: PipelineImageInput,
    masked_image_latents: TensorType | None = None,
    height: int | None = None,
    width: int | None = None,
    padding_mask_crop: int | None = None,
    strength: float = 1,
    num_inference_steps: int = 50,
    timesteps: List[int] | None = None,
    sigmas: List[float] | None = None,
    guidance_scale: float = 7.5,
    negative_prompt: str | List[str] | None = None,
    num_images_per_prompt: int | None = 1,
    eta: float = 0,
    generator: GeneratorType | List[GeneratorType] | None = None,
    latents: TensorType | None = None,
    prompt_embeds: TensorType | None = None,
    negative_prompt_embeds: TensorType | None = None,
    ip_adapter_image: PipelineImageInput | None = None,
    ip_adapter_image_embeds: List[TensorType] | None = None,
    output_type: str | None = "pil",
    return_dict: bool = True,
    cross_attention_kwargs: Dict[str, Any] | None = None,
    clip_skip: int | None = None,
) -> ImageType:
    """Inpaint an image using Stable Diffusion"""
    pipeline = StableDiffusionInpaintPipeline.from_pretrained(  # pyright: ignore[reportUnknownMemberType]
        model_id_or_path, torch_dtype=torch.float16
    ).to(
        "cuda"
    )
    result = pipeline(
        prompt=prompt,
        image=image,
        mask_image=mask_image,
        masked_image_latents=assert_unchecked(masked_image_latents),
        height=height,
        width=width,
        padding_mask_crop=padding_mask_crop,
        strength=strength,
        num_inference_steps=num_inference_steps,
        timesteps=assert_unchecked(timesteps),
        sigmas=assert_unchecked(sigmas),
        guidance_scale=guidance_scale,
        negative_prompt=negative_prompt,
        num_images_per_prompt=num_images_per_prompt,
        eta=eta,
        generator=generator,
        latents=latents,
        prompt_embeds=prompt_embeds,
        negative_prompt_embeds=negative_prompt_embeds,
        ip_adapter_image=ip_adapter_image,
        ip_adapter_image_embeds=ip_adapter_image_embeds,
        output_type=output_type,
        return_dict=return_dict,
        cross_attention_kwargs=cross_attention_kwargs,
        clip_skip=assert_unchecked(clip_skip),
    )
    if isinstance(result, StableDiffusionPipelineOutput):
        output_image = result.images[0]
    else:
        output_image = result[0]
    if not isinstance(output_image, Image):
        raise ValueError("Expected image to be a PIL Image")
    return output_image


@mcp.tool
def stable_diffusion_xl_text_to_image(
    model_id_or_path: str,
    prompt: str | List[str],
    prompt_2: str | List[str] | None = None,
    height: int | None = None,
    width: int | None = None,
    num_inference_steps: int = 50,
    timesteps: List[int] | None = None,
    sigmas: List[float] | None = None,
    denoising_end: float | None = None,
    guidance_scale: float = 5,
    negative_prompt: str | List[str] | None = None,
    negative_prompt_2: str | List[str] | None = None,
    num_images_per_prompt: int | None = 1,
    eta: float = 0,
    generator: GeneratorType | List[GeneratorType] | None = None,
    latents: TensorType | None = None,
    prompt_embeds: TensorType | None = None,
    negative_prompt_embeds: TensorType | None = None,
    pooled_prompt_embeds: TensorType | None = None,
    negative_pooled_prompt_embeds: TensorType | None = None,
    ip_adapter_image: PipelineImageInput | None = None,
    ip_adapter_image_embeds: List[TensorType] | None = None,
    output_type: str | None = "pil",
    return_dict: bool = True,
    cross_attention_kwargs: Dict[str, Any] | None = None,
    guidance_rescale: float = 0,
    original_size: Tuple[int, int] | None = None,
    crops_coords_top_left: Tuple[int, int] = (0, 0),
    target_size: Tuple[int, int] | None = None,
    negative_original_size: Tuple[int, int] | None = None,
    negative_crops_coords_top_left: Tuple[int, int] = (0, 0),
    negative_target_size: Tuple[int, int] | None = None,
    clip_skip: int | None = None,
) -> ImageType:
    """Generate an image from a prompt using Stable Diffusion XL"""
    pipeline = StableDiffusionXLPipeline.from_pretrained(  # pyright: ignore[reportUnknownMemberType]
        model_id_or_path, torch_dtype=torch.float16
    ).to(
        "cuda"
    )
    result = pipeline(  # pyright: ignore[reportUnknownVariableType]
        prompt=prompt,
        prompt_2=prompt_2,
        height=height,
        width=width,
        num_inference_steps=num_inference_steps,
        timesteps=assert_unchecked(timesteps),
        sigmas=assert_unchecked(sigmas),
        denoising_end=denoising_end,
        guidance_scale=guidance_scale,
        negative_prompt=negative_prompt,
        negative_prompt_2=negative_prompt_2,
        num_images_per_prompt=num_images_per_prompt,
        eta=eta,
        generator=generator,
        latents=latents,
        prompt_embeds=prompt_embeds,
        negative_prompt_embeds=negative_prompt_embeds,
        pooled_prompt_embeds=pooled_prompt_embeds,
        negative_pooled_prompt_embeds=negative_pooled_prompt_embeds,
        ip_adapter_image=ip_adapter_image,
        ip_adapter_image_embeds=ip_adapter_image_embeds,
        output_type=output_type,
        return_dict=return_dict,
        cross_attention_kwargs=cross_attention_kwargs,
        guidance_rescale=guidance_rescale,
        original_size=original_size,
        crops_coords_top_left=crops_coords_top_left,
        target_size=target_size,
        negative_original_size=negative_original_size,
        negative_crops_coords_top_left=negative_crops_coords_top_left,
        negative_target_size=negative_target_size,
        clip_skip=clip_skip,
    )
    if isinstance(result, StableDiffusionXLPipelineOutput):
        image = result.images[0]
    else:
        image = result[0]  # pyright: ignore[reportUnknownVariableType]
    if not isinstance(image, Image):
        raise ValueError("Expected image to be a PIL Image")
    return image


@mcp.tool
def stable_diffusion_xl_img2img(
    model_id_or_path: str,
    prompt: str | List[str],
    image: PipelineImageInput,
    prompt_2: str | List[str] | None = None,
    strength: float = 0.3,
    num_inference_steps: int = 50,
    timesteps: List[int] | None = None,
    sigmas: List[float] | None = None,
    denoising_start: float | None = None,
    denoising_end: float | None = None,
    guidance_scale: float = 5,
    negative_prompt: str | List[str] | None = None,
    negative_prompt_2: str | List[str] | None = None,
    num_images_per_prompt: int | None = 1,
    eta: float = 0,
    generator: GeneratorType | List[GeneratorType] | None = None,
    latents: TensorType | None = None,
    prompt_embeds: TensorType | None = None,
    negative_prompt_embeds: TensorType | None = None,
    pooled_prompt_embeds: TensorType | None = None,
    negative_pooled_prompt_embeds: TensorType | None = None,
    ip_adapter_image: PipelineImageInput | None = None,
    ip_adapter_image_embeds: List[TensorType] | None = None,
    output_type: str | None = "pil",
    return_dict: bool = True,
    cross_attention_kwargs: Dict[str, Any] | None = None,
    guidance_rescale: float = 0,
    original_size: Tuple[int, int] | None = None,
    crops_coords_top_left: Tuple[int, int] = (0, 0),
    target_size: Tuple[int, int] | None = None,
    negative_original_size: Tuple[int, int] | None = None,
    negative_crops_coords_top_left: Tuple[int, int] = (0, 0),
    negative_target_size: Tuple[int, int] | None = None,
    aesthetic_score: float = 6,
    negative_aesthetic_score: float = 2.5,
    clip_skip: int | None = None,
) -> ImageType:
    """Generate an image from a prompt and input image using Stable Diffusion XL"""
    pipeline = StableDiffusionXLImg2ImgPipeline.from_pretrained(  # pyright: ignore[reportUnknownMemberType]
        model_id_or_path, torch_dtype=torch.float16
    ).to(
        "cuda"
    )
    result = pipeline(
        prompt=prompt,
        image=image,
        prompt_2=prompt_2,
        strength=strength,
        num_inference_steps=num_inference_steps,
        timesteps=assert_unchecked(timesteps),
        sigmas=assert_unchecked(sigmas),
        denoising_start=denoising_start,
        denoising_end=denoising_end,
        guidance_scale=guidance_scale,
        negative_prompt=negative_prompt,
        negative_prompt_2=negative_prompt_2,
        num_images_per_prompt=num_images_per_prompt,
        eta=eta,
        generator=generator,
        latents=latents,
        prompt_embeds=prompt_embeds,
        negative_prompt_embeds=negative_prompt_embeds,
        pooled_prompt_embeds=pooled_prompt_embeds,
        negative_pooled_prompt_embeds=negative_pooled_prompt_embeds,
        ip_adapter_image=ip_adapter_image,
        ip_adapter_image_embeds=ip_adapter_image_embeds,
        output_type=output_type,
        return_dict=return_dict,
        cross_attention_kwargs=cross_attention_kwargs,
        guidance_rescale=guidance_rescale,
        original_size=assert_unchecked(original_size),
        crops_coords_top_left=crops_coords_top_left,
        target_size=assert_unchecked(target_size),
        negative_original_size=negative_original_size,
        negative_crops_coords_top_left=negative_crops_coords_top_left,
        negative_target_size=negative_target_size,
        aesthetic_score=aesthetic_score,
        negative_aesthetic_score=negative_aesthetic_score,
        clip_skip=clip_skip,
    )
    if isinstance(result, StableDiffusionXLPipelineOutput):
        output_image = result.images[0]
    else:
        output_image = result[0]
    if not isinstance(output_image, Image):
        raise ValueError("Expected image to be a PIL Image")
    return output_image


@mcp.tool
def stable_diffusion_xl_inpaint(
    model_id_or_path: str,
    prompt: str | List[str],
    image: PipelineImageInput,
    mask_image: PipelineImageInput,
    prompt_2: str | List[str] | None = None,
    masked_image_latents: TensorType | None = None,
    height: int | None = None,
    width: int | None = None,
    padding_mask_crop: int | None = None,
    strength: float = 0.9999,
    num_inference_steps: int = 50,
    timesteps: List[int] | None = None,
    sigmas: List[float] | None = None,
    denoising_start: float | None = None,
    denoising_end: float | None = None,
    guidance_scale: float = 7.5,
    negative_prompt: str | List[str] | None = None,
    negative_prompt_2: str | List[str] | None = None,
    num_images_per_prompt: int | None = 1,
    eta: float = 0,
    generator: GeneratorType | List[GeneratorType] | None = None,
    latents: TensorType | None = None,
    prompt_embeds: TensorType | None = None,
    negative_prompt_embeds: TensorType | None = None,
    pooled_prompt_embeds: TensorType | None = None,
    negative_pooled_prompt_embeds: TensorType | None = None,
    ip_adapter_image: PipelineImageInput | None = None,
    ip_adapter_image_embeds: List[TensorType] | None = None,
    output_type: str | None = "pil",
    return_dict: bool = True,
    cross_attention_kwargs: Dict[str, Any] | None = None,
    guidance_rescale: float = 0,
    original_size: Tuple[int, int] | None = None,
    crops_coords_top_left: Tuple[int, int] = (0, 0),
    target_size: Tuple[int, int] | None = None,
    negative_original_size: Tuple[int, int] | None = None,
    negative_crops_coords_top_left: Tuple[int, int] = (0, 0),
    negative_target_size: Tuple[int, int] | None = None,
    aesthetic_score: float = 6,
    negative_aesthetic_score: float = 2.5,
    clip_skip: int | None = None,
) -> ImageType:
    """Inpaint an image using Stable Diffusion XL"""
    pipeline = StableDiffusionXLInpaintPipeline.from_pretrained(  # pyright: ignore[reportUnknownMemberType]
        model_id_or_path, torch_dtype=torch.float16
    ).to(
        "cuda"
    )
    result = pipeline(
        prompt=prompt,
        prompt_2=prompt_2,
        image=image,
        mask_image=mask_image,
        masked_image_latents=assert_unchecked(masked_image_latents),
        height=height,
        width=width,
        padding_mask_crop=padding_mask_crop,
        strength=strength,
        num_inference_steps=num_inference_steps,
        timesteps=assert_unchecked(timesteps),
        sigmas=assert_unchecked(sigmas),
        denoising_start=denoising_start,
        denoising_end=denoising_end,
        guidance_scale=guidance_scale,
        negative_prompt=negative_prompt,
        negative_prompt_2=negative_prompt_2,
        num_images_per_prompt=num_images_per_prompt,
        eta=eta,
        generator=generator,
        latents=latents,
        prompt_embeds=prompt_embeds,
        negative_prompt_embeds=negative_prompt_embeds,
        pooled_prompt_embeds=pooled_prompt_embeds,
        negative_pooled_prompt_embeds=negative_pooled_prompt_embeds,
        ip_adapter_image=ip_adapter_image,
        ip_adapter_image_embeds=ip_adapter_image_embeds,
        output_type=output_type,
        return_dict=return_dict,
        cross_attention_kwargs=cross_attention_kwargs,
        guidance_rescale=guidance_rescale,
        original_size=assert_unchecked(original_size),
        crops_coords_top_left=crops_coords_top_left,
        target_size=assert_unchecked(target_size),
        negative_original_size=negative_original_size,
        negative_crops_coords_top_left=negative_crops_coords_top_left,
        negative_target_size=negative_target_size,
        aesthetic_score=aesthetic_score,
        negative_aesthetic_score=negative_aesthetic_score,
        clip_skip=clip_skip,
    )
    if isinstance(result, StableDiffusionXLPipelineOutput):
        output_image = result.images[0]
    else:
        output_image = result[0]
    if not isinstance(output_image, Image):
        raise ValueError("Expected image to be a PIL Image")
    return output_image


@mcp.tool
def stable_diffusion_3_text_to_image(
    model_id_or_path: str,
    prompt: str | List[str],
    prompt_2: str | List[str] | None = None,
    prompt_3: str | List[str] | None = None,
    height: int | None = None,
    width: int | None = None,
    num_inference_steps: int = 28,
    sigmas: List[float] | None = None,
    guidance_scale: float = 7,
    negative_prompt: str | List[str] | None = None,
    negative_prompt_2: str | List[str] | None = None,
    negative_prompt_3: str | List[str] | None = None,
    num_images_per_prompt: int | None = 1,
    generator: GeneratorType | List[GeneratorType] | None = None,
    latents: FloatTensor | None = None,
    prompt_embeds: FloatTensor | None = None,
    negative_prompt_embeds: FloatTensor | None = None,
    pooled_prompt_embeds: FloatTensor | None = None,
    negative_pooled_prompt_embeds: FloatTensor | None = None,
    ip_adapter_image: PipelineImageInput | None = None,
    ip_adapter_image_embeds: TensorType | None = None,
    output_type: str | None = "pil",
    return_dict: bool = True,
    joint_attention_kwargs: Dict[str, Any] | None = None,
    clip_skip: int | None = None,
    max_sequence_length: int = 256,
    skip_guidance_layers: List[int] | None = None,
    skip_layer_guidance_scale: float = 2.8,
    skip_layer_guidance_stop: float = 0.2,
    skip_layer_guidance_start: float = 0.01,
    mu: float | None = None,
) -> ImageType:
    """Generate an image from a prompt using Stable Diffusion 3"""
    pipeline = StableDiffusion3Pipeline.from_pretrained(  # pyright: ignore[reportUnknownMemberType]
        model_id_or_path, torch_dtype=torch.float16
    ).to(
        "cuda"
    )
    result = pipeline(  # pyright: ignore[reportUnknownVariableType]
        prompt=prompt,
        prompt_2=prompt_2,
        prompt_3=prompt_3,
        height=height,
        width=width,
        num_inference_steps=num_inference_steps,
        sigmas=sigmas,
        guidance_scale=guidance_scale,
        negative_prompt=negative_prompt,
        negative_prompt_2=negative_prompt_2,
        negative_prompt_3=negative_prompt_3,
        num_images_per_prompt=num_images_per_prompt,
        generator=generator,
        latents=latents,
        prompt_embeds=prompt_embeds,
        negative_prompt_embeds=negative_prompt_embeds,
        pooled_prompt_embeds=pooled_prompt_embeds,
        negative_pooled_prompt_embeds=negative_pooled_prompt_embeds,
        ip_adapter_image=ip_adapter_image,
        ip_adapter_image_embeds=ip_adapter_image_embeds,
        output_type=output_type,
        return_dict=return_dict,
        joint_attention_kwargs=joint_attention_kwargs,
        clip_skip=clip_skip,
        max_sequence_length=max_sequence_length,
        skip_guidance_layers=assert_unchecked(skip_guidance_layers),
        skip_layer_guidance_scale=skip_layer_guidance_scale,
        skip_layer_guidance_stop=skip_layer_guidance_stop,
        skip_layer_guidance_start=skip_layer_guidance_start,
        mu=mu,
    )
    if isinstance(result, StableDiffusion3PipelineOutput):
        image = result.images[0]
    else:
        image = result[0]  # pyright: ignore[reportUnknownVariableType]
    if not isinstance(image, Image):
        raise ValueError("Expected image to be a PIL Image")
    return image


@mcp.tool
def stable_diffusion_3_img2img(
    model_id_or_path: str,
    prompt: str | List[str],
    image: PipelineImageInput,
    prompt_2: str | List[str] | None = None,
    prompt_3: str | List[str] | None = None,
    height: int | None = None,
    width: int | None = None,
    strength: float = 0.6,
    num_inference_steps: int = 50,
    sigmas: List[float] | None = None,
    guidance_scale: float = 7,
    negative_prompt: str | List[str] | None = None,
    negative_prompt_2: str | List[str] | None = None,
    negative_prompt_3: str | List[str] | None = None,
    num_images_per_prompt: int | None = 1,
    generator: GeneratorType | List[GeneratorType] | None = None,
    latents: FloatTensor | None = None,
    prompt_embeds: FloatTensor | None = None,
    negative_prompt_embeds: FloatTensor | None = None,
    pooled_prompt_embeds: FloatTensor | None = None,
    negative_pooled_prompt_embeds: FloatTensor | None = None,
    output_type: str | None = "pil",
    ip_adapter_image: PipelineImageInput | None = None,
    ip_adapter_image_embeds: TensorType | None = None,
    return_dict: bool = True,
    joint_attention_kwargs: Dict[str, Any] | None = None,
    clip_skip: int | None = None,
    max_sequence_length: int = 256,
    mu: float | None = None,
) -> ImageType:
    """Generate an image from a prompt and input image using Stable Diffusion 3"""
    pipeline = StableDiffusion3Img2ImgPipeline.from_pretrained(  # pyright: ignore[reportUnknownMemberType]
        model_id_or_path, torch_dtype=torch.float16
    ).to(
        "cuda"
    )
    result = pipeline(
        prompt=prompt,
        image=image,
        prompt_2=prompt_2,
        prompt_3=prompt_3,
        height=height,
        width=width,
        strength=strength,
        num_inference_steps=num_inference_steps,
        sigmas=sigmas,
        guidance_scale=guidance_scale,
        negative_prompt=negative_prompt,
        negative_prompt_2=negative_prompt_2,
        negative_prompt_3=negative_prompt_3,
        num_images_per_prompt=num_images_per_prompt,
        generator=generator,
        latents=latents,
        prompt_embeds=prompt_embeds,
        negative_prompt_embeds=negative_prompt_embeds,
        pooled_prompt_embeds=pooled_prompt_embeds,
        negative_pooled_prompt_embeds=negative_pooled_prompt_embeds,
        output_type=output_type,
        ip_adapter_image=ip_adapter_image,
        ip_adapter_image_embeds=ip_adapter_image_embeds,
        return_dict=return_dict,
        joint_attention_kwargs=joint_attention_kwargs,
        clip_skip=clip_skip,
        max_sequence_length=max_sequence_length,
        mu=mu,
    )
    if isinstance(result, StableDiffusionXLPipelineOutput):
        output_image = result.images[0]
    else:
        output_image = result[0]
    if not isinstance(output_image, Image):
        raise ValueError("Expected image to be a PIL Image")
    return output_image


@mcp.tool
def stable_diffusion_3_inpaint(
    model_id_or_path: str,
    prompt: str | List[str],
    image: PipelineImageInput,
    mask_image: PipelineImageInput,
    prompt_2: str | List[str] | None = None,
    prompt_3: str | List[str] | None = None,
    masked_image_latents: PipelineImageInput | None = None,
    height: int | None = None,
    width: int | None = None,
    padding_mask_crop: int | None = None,
    strength: float = 0.6,
    num_inference_steps: int = 50,
    sigmas: List[float] | None = None,
    guidance_scale: float = 7,
    negative_prompt: str | List[str] | None = None,
    negative_prompt_2: str | List[str] | None = None,
    negative_prompt_3: str | List[str] | None = None,
    num_images_per_prompt: int | None = 1,
    generator: GeneratorType | List[GeneratorType] | None = None,
    latents: TensorType | None = None,
    prompt_embeds: TensorType | None = None,
    negative_prompt_embeds: TensorType | None = None,
    pooled_prompt_embeds: TensorType | None = None,
    negative_pooled_prompt_embeds: TensorType | None = None,
    ip_adapter_image: PipelineImageInput | None = None,
    ip_adapter_image_embeds: TensorType | None = None,
    output_type: str | None = "pil",
    return_dict: bool = True,
    joint_attention_kwargs: Dict[str, Any] | None = None,
    clip_skip: int | None = None,
    max_sequence_length: int = 256,
    mu: float | None = None,
) -> ImageType:
    """Inpaint an image using Stable Diffusion 3"""
    pipeline = StableDiffusion3InpaintPipeline.from_pretrained(  # pyright: ignore[reportUnknownMemberType]
        model_id_or_path, torch_dtype=torch.float16
    ).to(
        "cuda"
    )
    result = pipeline(
        prompt=prompt,
        image=image,
        mask_image=mask_image,
        prompt_2=prompt_2,
        prompt_3=prompt_3,
        masked_image_latents=assert_unchecked(masked_image_latents),
        height=assert_unchecked(height),
        width=assert_unchecked(width),
        padding_mask_crop=padding_mask_crop,
        strength=strength,
        num_inference_steps=num_inference_steps,
        sigmas=sigmas,
        guidance_scale=guidance_scale,
        negative_prompt=negative_prompt,
        negative_prompt_2=negative_prompt_2,
        negative_prompt_3=negative_prompt_3,
        num_images_per_prompt=num_images_per_prompt,
        generator=generator,
        latents=latents,
        prompt_embeds=prompt_embeds,
        negative_prompt_embeds=negative_prompt_embeds,
        pooled_prompt_embeds=pooled_prompt_embeds,
        negative_pooled_prompt_embeds=negative_pooled_prompt_embeds,
        ip_adapter_image=ip_adapter_image,
        ip_adapter_image_embeds=ip_adapter_image_embeds,
        output_type=output_type,
        return_dict=return_dict,
        joint_attention_kwargs=joint_attention_kwargs,
        clip_skip=clip_skip,
        max_sequence_length=max_sequence_length,
        mu=mu,
    )
    if isinstance(result, StableDiffusion3PipelineOutput):
        output_image = result.images[0]
    else:
        output_image = result[0]
    if not isinstance(output_image, Image):
        raise ValueError("Expected image to be a PIL Image")
    return output_image


if __name__ == "__main__":
    mcp.run()
