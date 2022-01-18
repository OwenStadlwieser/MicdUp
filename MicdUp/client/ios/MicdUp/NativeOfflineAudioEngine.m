// RCTCalendarModule.m
#import "NativeOfflineAudioEngine.h"

@implementation NativeOfflineAudioEngine

// To export a module named RCTCalendarModule
RCT_EXPORT_MODULE();
RCT_EXPORT_METHOD(applyFilter:(NSString)sourceFileURL
                    (NSString)outputFileName
                  (NSNumber)pitch
                  (NSNumber)reverb
                    successCallback: (RCTResponseSenderBlock)successCallback)
{
    NSNumber *eventId = [NSNumber numberWithInt:123];
    successCallback(@[eventId]);
    let sourceFile: AVAudioFile
    let format: AVAudioFormat
    do {
        let fileUrl = URL(string: sourceFileURL)
        sourceFile = try AVAudioFile(forReading: fileUrl)
        format = sourceFile.processingFormat
    } catch {
        fatalError("Unable to load the source audio file: \(error.localizedDescription).")
    }
    let engine = AVAudioEngine()
    let player = AVAudioPlayerNode()
    let reverb = AVAudioUnitReverb()

    engine.attach(player)
    engine.attach(reverb)

    // Set the desired reverb parameters.
    reverb.loadFactoryPreset(.mediumHall)
    reverb.wetDryMix = 50

    // Connect the nodes.
    engine.connect(player, to: reverb, format: format)
    engine.connect(reverb, to: engine.mainMixerNode, format: format)

    // Schedule the source file.
    player.scheduleFile(sourceFile, at: nil)
    do {
     // The maximum number of frames the engine renders in any single render call.
        let maxFrames: AVAudioFrameCount = 4096
        try engine.enableManualRenderingMode(.offline, format: format,
                                            maximumFrameCount: maxFrames)
    } catch {
        fatalError("Enabling manual rendering mode failed: \(error).")
    }
    // The output buffer to which the engine renders the processed data.
    let buffer = AVAudioPCMBuffer(pcmFormat: engine.manualRenderingFormat,
                                frameCapacity: engine.manualRenderingMaximumFrameCount)!

    let outputFile: AVAudioFile
    do {
        let documentsURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let outputURL = documentsURL.appendingPathComponent(outputFileName + ".caf")
        outputFile = try AVAudioFile(forWriting: outputURL, settings: sourceFile.fileFormat.settings)
    } catch {
        fatalError("Unable to open output audio file: \(error).")
    }

    while engine.manualRenderingSampleTime < sourceFile.length {
        do {
            let frameCount = sourceFile.length - engine.manualRenderingSampleTime
            let framesToRender = min(AVAudioFrameCount(frameCount), buffer.frameCapacity)
            
            let status = try engine.renderOffline(framesToRender, to: buffer)
            
            switch status {
                
            case .success:
                // The data rendered successfully. Write it to the output file.
                try outputFile.write(from: buffer)
                
            case .insufficientDataFromInputNode:
                // Applicable only when using the input node as one of the sources.
                break
                
            case .cannotDoInCurrentContext:
                // The engine couldn't render in the current render call.
                // Retry in the next iteration.
                break
                
            case .error:
                // An error occurred while rendering the audio.
                fatalError("The manual rendering failed.")
            }
        } catch {
            fatalError("The manual rendering failed: \(error).")
        }
    }


}
@end