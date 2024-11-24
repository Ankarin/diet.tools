import { SubscribeButton } from "@/app/me/subscription/subcribe-button";
import { CheckCircle } from "lucide-react";

export default function SubscribePage() {
  return (
    <div className="">
      <div className="max-w-4xl mx-auto px-4 md:py-16 sm:px-6 ">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Transform Your Body with AI
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            Get personalized meal plans, nutritional insights, and achieve your
            health goals faster than ever.
          </p>
        </div>

        <div className="mt-8 md:mt-16">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="px-6 py-4 sm:p-10 sm:pb-6">
              <div className="mt-4 flex justify-center text-6xl font-extrabold text-gray-900">
                <span className="ml-1 mr-3 text-xl font-medium text-gray-500 self-start ">
                  $
                </span>
                10
                <span className="ml-1 text-2xl font-medium text-gray-500 self-end">
                  /month
                </span>
              </div>
            </div>
            <div className="px-6 pb-8 sm:px-10  sm:pb-10">
              <ul className="space-y-4">
                {[
                  "Personalized meal plans tailored to your preferences",
                  "Advanced nutritional analysis and insights",
                  "Unlimited recipe suggestions and variations",
                  "Progress tracking and goal setting features",
                  "24/7 AI-powered diet assistance",
                ].map((feature) => (
                  <li key={feature} className="flex items-start">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    </div>
                    <p className="ml-3 text-base text-gray-700">{feature}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <SubscribeButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
